import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { Database } from './database';

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const RP_ID = process.env.RP_ID || 'localhost';
const RP_NAME = process.env.RP_NAME || 'WebAuthn Demo';
const ORIGIN = process.env.ORIGIN || `http://localhost:4200`;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));
app.use(cors({
  origin: ORIGIN,
  credentials: true,
}));
app.use(express.json());

const db = new Database();

// JWT Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    await db.createUser(userId, email, hashedPassword, name);

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// WebAuthn Registration
app.post('/api/webauthn/reg-options', authenticateToken, async (req: any, res) => {
  try {
    const user = await db.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: user.id,
      userName: user.email,
      userDisplayName: user.name || user.email,
      attestationType: 'none',
      excludeCredentials: [],
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    await db.createChallenge(req.user.userId, options.challenge);

    res.json(options);
  } catch (error) {
    console.error('WebAuthn reg options error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/webauthn/reg-verify', authenticateToken, async (req: any, res) => {
  try {
    const { attResp } = req.body;
    const user = await db.getUserById(req.user.userId);
    const challenge = await db.getChallenge(req.user.userId);

    if (!user || !challenge) {
      return res.status(404).json({ error: 'User or challenge not found' });
    }

    const verification = await verifyRegistrationResponse({
      response: attResp,
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

      await db.createAuthenticator(
        req.user.userId,
        credentialID,
        credentialPublicKey,
        counter,
        'WebAuthn Authenticator'
      );

      await db.deleteChallenge(req.user.userId);
      
      return res.json({ verified: true });
    }

    res.status(400).json({ error: 'Registration verification failed' });
  } catch (error) {
    console.error('WebAuthn reg verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// WebAuthn Authentication
app.post('/api/webauthn/auth-options', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await db.getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const authenticators = await db.getUserAuthenticators(user.id);

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: authenticators.map(auth => ({
        id: auth.credential_id,
        type: 'public-key',
      })),
      userVerification: 'preferred',
    });

    await db.createChallenge(user.id, options.challenge);

    res.json(options);
  } catch (error) {
    console.error('WebAuthn auth options error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/webauthn/auth-verify', async (req, res) => {
  try {
    const { email, authResp } = req.body;
    const user = await db.getUserByEmail(email);
    const challenge = await db.getChallenge(user.id);

    if (!user || !challenge) {
      return res.status(404).json({ error: 'User or challenge not found' });
    }

    const authenticator = await db.getAuthenticatorByCredentialId(authResp.id);

    if (!authenticator) {
      return res.status(404).json({ error: 'Authenticator not found' });
    }

    const verification = await verifyAuthenticationResponse({
      response: authResp,
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator: {
        credentialID: authenticator.credential_id,
        credentialPublicKey: authenticator.public_key,
        counter: authenticator.counter,
        transports: ['usb', 'nfc', 'ble', 'internal'],
      },
    });

    if (verification.verified) {
      await db.updateAuthenticatorCounter(authResp.id, verification.authenticationInfo.newCounter);
      await db.deleteChallenge(user.id);

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({ 
        verified: true,
        token,
        user: { id: user.id, email: user.email, name: user.name }
      });
    }

    res.status(400).json({ error: 'Authentication verification failed' });
  } catch (error) {
    console.error('WebAuthn auth verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected route example
app.get('/api/profile', authenticateToken, async (req: any, res) => {
  try {
    const user = await db.getUserById(req.user.userId);
    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});