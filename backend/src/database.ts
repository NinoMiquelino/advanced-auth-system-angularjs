import sqlite3 from 'sqlite3';
import { promisify } from 'util';

export class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(':memory:');
    this.initDatabase();
  }

  private initDatabase() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS authenticators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        credential_id BLOB UNIQUE NOT NULL,
        public_key BLOB NOT NULL,
        counter INTEGER NOT NULL DEFAULT 0,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      `CREATE TABLE IF NOT EXISTS challenges (
        user_id TEXT PRIMARY KEY,
        challenge TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`
    ];

    queries.forEach(query => {
      this.db.run(query);
    });
  }

  // User methods
  async createUser(id: string, email: string, passwordHash: string, name?: string): Promise<void> {
    const run = promisify(this.db.run.bind(this.db));
    await run('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)', 
      [id, email, passwordHash, name]);
  }

  async getUserByEmail(email: string): Promise<any> {
    const get = promisify(this.db.get.bind(this.db));
    return await get('SELECT * FROM users WHERE email = ?', [email]);
  }

  async getUserById(id: string): Promise<any> {
    const get = promisify(this.db.get.bind(this.db));
    return await get('SELECT * FROM users WHERE id = ?', [id]);
  }

  // Authenticator methods
  async createAuthenticator(userId: string, credentialId: Buffer, publicKey: Buffer, counter: number, name: string): Promise<void> {
    const run = promisify(this.db.run.bind(this.db));
    await run('INSERT INTO authenticators (user_id, credential_id, public_key, counter, name) VALUES (?, ?, ?, ?, ?)',
      [userId, credentialId, publicKey, counter, name]);
  }

  async getUserAuthenticators(userId: string): Promise<any[]> {
    const all = promisify(this.db.all.bind(this.db));
    return await all('SELECT * FROM authenticators WHERE user_id = ?', [userId]);
  }

  async getAuthenticatorByCredentialId(credentialId: string): Promise<any> {
    const get = promisify(this.db.get.bind(this.db));
    return await get('SELECT * FROM authenticators WHERE credential_id = ?', [Buffer.from(credentialId, 'base64')]);
  }

  async updateAuthenticatorCounter(credentialId: string, counter: number): Promise<void> {
    const run = promisify(this.db.run.bind(this.db));
    await run('UPDATE authenticators SET counter = ? WHERE credential_id = ?', 
      [counter, Buffer.from(credentialId, 'base64')]);
  }

  // Challenge methods
  async createChallenge(userId: string, challenge: string): Promise<void> {
    const run = promisify(this.db.run.bind(this.db));
    await run('INSERT OR REPLACE INTO challenges (user_id, challenge) VALUES (?, ?)', [userId, challenge]);
  }

  async getChallenge(userId: string): Promise<string> {
    const get = promisify(this.db.get.bind(this.db));
    const result = await get('SELECT challenge FROM challenges WHERE user_id = ?', [userId]);
    return result?.challenge;
  }

  async deleteChallenge(userId: string): Promise<void> {
    const run = promisify(this.db.run.bind(this.db));
    await run('DELETE FROM challenges WHERE user_id = ?', [userId]);
  }
}