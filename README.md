# 📨 telegram-messenger

A minimal full-stack tool to send a Telegram message to any chat ID.  
**React** frontend (Vite) + **Node.js / Express** backend — no database, single endpoint.

---

## 🗂️ Project Structure

```
telegram-messenger/
├── backend/                  # Express MVC API
│   ├── src/
│   │   ├── config/           # env loader & validation
│   │   ├── controllers/      # sendMessageController
│   │   ├── middlewares/      # CORS, rate-limiter, error handler
│   │   ├── routes/           # POST /api/send-message
│   │   └── services/         # telegramService (Telegram Bot API wrapper)
│   ├── .env                  # ⚠️ gitignored — copy from .env.example
│   ├── .env.example
│   └── package.json
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── assets/           # Static files (icons, images)
│   │   ├── components/       # MessageForm, StatusBanner
│   │   ├── pages/            # HomePage
│   │   ├── services/         # api.js (fetch wrapper for the backend)
│   │   └── styles/           # Global minimalist CSS
│   ├── .env                  # ⚠️ gitignored — copy from .env.example
│   ├── .env.example
│   └── package.json
├── docs/
│   └── adr/                  # Architecture Decision Records
│       └── ADR-001-architectural-foundation.md
├── Project-specification/    # Architecture specs & pipeline state
├── Jenkinsfile               # Jenkins CI/CD pipeline
└── .gitignore
```

---

## ⚡ Quickstart

### Prerequisites
- **Node.js** >= 18.x
- A **Telegram Bot Token** from [@BotFather](https://t.me/BotFather)

---

### 1. Clone the repository

```bash
git clone https://github.com/jhee1995/telegram_messenger.git
cd telegram_messenger
```

---

### 2. Configure the Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and fill in your values:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
TELEGRAM_BOT_TOKEN=your_real_bot_token_here   # ← Required!
TELEGRAM_API_URL=https://api.telegram.org
APP_SECRET=generate_a_32char_random_hex_string
```

> **How to get a Bot Token**: Open Telegram → search `@BotFather` → `/newbot` → copy the token.

---

### 3. Configure the Frontend

```bash
cd ../frontend
cp .env.example .env
```

The default value works for local development:
```env
VITE_BACKEND_URL=http://localhost:3001
```

---

### 4. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

### 5. Run in development mode

Open **two terminal tabs**:

```bash
# Terminal 1 — Backend
cd backend && npm run dev
# → Express listens on http://localhost:3001

# Terminal 2 — Frontend
cd frontend && npm run dev
# → Vite serves on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔌 API Reference

### `POST /api/send-message`

Sends a message to a Telegram chat via the configured bot.

**Request body** (JSON):

```json
{
  "chatId": "123456789",
  "message": "Hello from the telegram-messenger app!"
}
```

**Success response** `200 OK`:

```json
{
  "success": true,
  "messageId": 42
}
```

**Error response** `400 / 500`:

```json
{
  "success": false,
  "error": "chatId and message are required"
}
```

> **How to find your Chat ID**: Message [@userinfobot](https://t.me/userinfobot) on Telegram — it replies with your chat ID.

---

## 🔐 Security Notes

- All secrets live in `.env` files — **never committed** to source control.
- CORS is restricted to `FRONTEND_URL` (no wildcard).
- Rate limiting is applied to `POST /api/send-message` to prevent abuse.
- See [`Project-specification/security-requirements.md`](./Project-specification/security-requirements.md) for the full threat model.

---

## 🏗️ CI/CD

This project uses **Jenkins** connected to `https://github.com/jhee1995/telegram_messenger.git`.  
See [`Jenkinsfile`](./Jenkinsfile) for the pipeline definition.

---

## 📄 Architecture Decisions

See [`docs/adr/ADR-001-architectural-foundation.md`](./docs/adr/ADR-001-architectural-foundation.md).
