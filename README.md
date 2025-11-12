## 🙋‍♂️ Autor

<div align="center">
  <img src="https://avatars.githubusercontent.com/ninomiquelino" width="100" height="100" style="border-radius: 50%">
  <br>
  <strong>Onivaldo Miquelino</strong>
  <br>
  <a href="https://github.com/ninomiquelino">@ninomiquelino</a>
</div>

---

# 🔐 Advanced Authentication System

![Angular](https://img.shields.io/badge/Angular-16-DD0031?logo=angular)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=nodedotjs)
![WebAuthn](https://img.shields.io/badge/WebAuthn-Passkeys-FF6B6B?logo=webauthn)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1-3178C6?logo=typescript)
![Security](https://img.shields.io/badge/Security-CSP%2C%20JWT-brightgreen)

Sistema completo de autenticação moderna implementando **WebAuthn/Passkeys**, **JWT** e **CSP** em Angular e Node.js. Oferece autenticação tradicional por senha e passwordless através de biometria, Windows Hello, Face ID, ou segurança do dispositivo.

## ✨ Características Principais

### 🔒 Segurança Avançada
- **WebAuthn/Passkeys** - Autenticação sem senhas usando FIDO2
- **JWT Tokens** - Autenticação stateless com expiração
- **Content Security Policy** - Proteção contra XSS e ataques
- **CORS Configurado** - Controle de origens permitidas
- **Helmet.js** - Headers de segurança HTTP

### 🚀 Tecnologias Modernas
- **Angular 16** - Frontend robusto e reativo
- **Node.js + Express** - API REST performática
- **TypeScript** - Tipagem estática em todo o projeto
- **SQLite** - Banco de dados leve e eficiente
- **SimpleWebAuthn** - Biblioteca FIDO2 confiável

### 👥 Experiência do Usuário
- **Login Duplo** - Senha tradicional ou WebAuthn
- **Interface Responsiva** - Design moderno e intuitivo
- **Registro Simples** - Fluxo de cadastro otimizado
- **Gerenciamento de Perfil** - Área do usuário segura

## 🏗️ Arquitetura do Sistema

```

advanced-auth-system-angularjs/
├──🖥️  Frontend (Angular)
│├── Components modulares
│├── Interceptadores de auth
│├── Guards de rota
│└── Serviços reativos
│
├──⚙️  Backend (Node.js/Express)
│├── API RESTful
│├── WebAuthn endpoints
│├── Middleware JWT
│└── Database layer
│
└──🔐 Protocolos de Segurança
├── WebAuthn (FIDO2)
├── JWT tokens
├── CSP headers
└── CORS policies

```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- Angular CLI 16+
- Navegador compatível com WebAuthn

### 1. Clone o Repositório
```bash
git clone https://github.com/NinoMiquelino/advanced-auth-system-angularjs.git
cd advanced-auth-system-angularjs
```

2. Configuração do Backend

```bash
cd backend
npm install

# Ambiente de desenvolvimento
npm run dev

# Ou para produção
npm run build
npm start
```

3. Configuração do Frontend

```bash
cd frontend
npm install

# Servidor de desenvolvimento
ng serve

# Build de produção
ng build
```

4. Variáveis de Ambiente (Opcional)

Crie um arquivo .env no backend:

```env
PORT=3000
JWT_SECRET=seu_super_secret_jwt_aqui
RP_ID=localhost
RP_NAME="Advanced Auth System"
ORIGIN=http://localhost:4200
```

🎯 Como Usar

Registro de Usuário

1. Acesse /register
2. Cadastre com email e senha
3. Faça login tradicional
4. Vá para "Add WebAuthn" para registrar passkey

Login Tradicional

· Email e senha<br>
· Geração de JWT token<br>
· Sessions seguras

Login com WebAuthn

· Insira apenas o email<br>
· Use biometria/segurança do dispositivo<br>
· Autenticação instantânea e segura

📡 API Endpoints

Autenticação Básica

Método Endpoint Descrição
POST /api/register Registro tradicional
POST /api/login Login com senha

WebAuthn

Método Endpoint Descrição
GET /api/webauthn/reg-options Opções de registro
POST /api/webauthn/reg-verify Verificação de registro
POST /api/webauthn/auth-options Opções de autenticação
POST /api/webauthn/auth-verify Verificação de autenticação

Protegidos

Método Endpoint Descrição
GET /api/profile Perfil do usuário

🔧 Desenvolvimento

Estrutura do Frontend

```
src/app/
├── components/
│   ├── login/           # Componente de login
│   ├── register/        # Componente de registro
│   ├── profile/         # Perfil do usuário
│   └── webauthn-register/ # Registro WebAuthn
├── services/
│   └── auth.service.ts  # Serviço de autenticação
├── guards/
│   └── auth.guard.ts    # Proteção de rotas
└── interceptors/
    └── auth.interceptor.ts # Interceptor JWT
```

Estrutura do Backend

```
src/
├── server.ts           # Servidor principal
├── database.ts         # Camada de dados
└── types/              # Definições TypeScript
```

Comandos Úteis

```bash
# Desenvolvimento simultâneo
concurrently "npm run dev" "ng serve"

# Build para produção
cd backend && npm run build
cd frontend && ng build --prod

# Testes (adicionar conforme necessidade)
npm test
```

🌐 Compatibilidade WebAuthn

Navegadores Suportados

· ✅ Chrome 67+<br>
· ✅ Firefox 60+<br>
· ✅ Safari 13+<br>
· ✅ Edge 18+

Dispositivos/Plataformas

· ✅ Windows Hello<br>
· ✅ Touch ID (macOS)<br>
· ✅ Face ID (iOS)<br>
· ✅ Android Biometric<br>
· ✅ Security Keys (YubiKey, etc.)

🔐 Considerações de Segurança

Implementado

· Validação de origem WebAuthn<br>
· Challenges únicos e temporários<br>
· Contador de autenticadores<br>
· Tokens JWT com expiração<br>
· CSP headers<br>
· CORS restritivo<br>
· Helmet.js security headers

Recomendações para Produção

· Use HTTPS em produção<br>
· Configure RP_ID corretamente para domínio<br>
· Implemente rate limiting<br>
· Adicione logging e monitoramento<br>
· Use banco de dados persistente (PostgreSQL/MySQL)

📝 Roadmap

· MFA (Multi-Factor Authentication)<br>
· Social login (Google, GitHub)<br>
· Recovery codes<br>
· Admin dashboard<br>
· Logs de auditoria<br>
· Testes unitários e e2e<br>
· Docker deployment<br>
· PWA capabilities

🙏 Agradecimentos

· SimpleWebAuthn - Excelente biblioteca FIDO2<br>
· Comunidade Angular e Node.js<br>
· Especificação FIDO2/WebAuthn

---

⭐ Se este projeto te ajudou, deixe uma estrela no repositório!

---

## 🤝 Contribuições
Contribuições são sempre bem-vindas!  
Sinta-se à vontade para abrir uma [*issue*](https://github.com/NinoMiquelino/advanced-auth-system-angularjs/issues) com sugestões ou enviar um [*pull request*](https://github.com/NinoMiquelino/advanced-auth-system-angularjs/pulls) com melhorias.

---

## 💬 Contato
📧 [Entre em contato pelo LinkedIn](https://www.linkedin.com/in/onivaldomiquelino/)  
💻 Desenvolvido por **Onivaldo Miquelino**

---
