# Initial Security & Threat Model Requirements
# Project: telegram-messenger
# Date: 2026-10-02

---

## 🔐 Authentication & Session Model

* **No user authentication required** for this internal tool (single-user scope).
* If exposed to a network beyond localhost, restrict access via network-level controls (firewall, VPN, or Jenkins-managed environment variables).
* The Telegram Bot Token acts as the sole credential — it **must never** be committed to source control.

---

## 🛡️ Data Classification & Sensitivity

| Classification | Data                                  | Handling                              |
|----------------|---------------------------------------|---------------------------------------|
| **Secret**     | `TELEGRAM_BOT_TOKEN`                  | `.env` only — gitignored, never logged |
| **Internal**   | Recipient phone/chat ID, message text | Not persisted; in-memory request only  |
| **Public**     | UI static assets                      | No restrictions                        |

---

## 🔒 Transport & API Security

* **CORS**: Backend must whitelist only the frontend origin (`FRONTEND_URL` env var). No wildcard `*` in production.
* **HTTPS**: Enforce TLS in CI/CD (Jenkins pipeline) for any non-localhost deployment.
* **Input Validation**: Backend must validate `chatId` and `message` fields — reject empty or malformed payloads with `400 Bad Request`.
* **Rate Limiting**: Apply a simple rate limiter (`express-rate-limit`) on the `/api/send-message` endpoint to prevent abuse.

---

## ⚠️ Threat Vectors

| Threat                     | Mitigation                                               |
|----------------------------|----------------------------------------------------------|
| Token exposure via git      | `.gitignore` covers `.env`; `.env.example` holds no secrets |
| SSRF via Telegram API URL   | `TELEGRAM_API_URL` validated against allowlist in config |
| Message injection / XSS    | Sanitize input on backend before forwarding to Telegram API |
| Credential leak in logs     | Never log `TELEGRAM_BOT_TOKEN` or raw request bodies    |

---

## 📦 Dependency Security

* Run `npm audit` in CI/CD pipeline (Jenkinsfile) for both `backend/` and `frontend/`.
* Pin direct dependency versions in `package.json` (no `^` on critical packages like `node-telegram-bot-api`).

---

## 🚫 Out of Scope

* Database encryption (no database used).
* Password hashing / JWT (no user accounts).
* Role-based access control (single-purpose tool).
