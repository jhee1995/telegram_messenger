# ADR-001: Architectural Foundation and Technology Stack

## 📅 Status
**Approved** — 2026-10-02

---

## 💡 Context

The project requires a minimal, purpose-built tool to send messages to a Telegram recipient via the Telegram Bot API. The system must:

* Expose a single REST endpoint (`POST /api/send-message`).
* Present a minimalist React UI allowing the user to type a phone/chat ID and a message.
* Keep all credentials and configuration in `.env` files — no hardcoded values.
* Be deployable via a Jenkins CI/CD pipeline connected to the GitHub repository `https://github.com/jhee1995/telegram_messenger.git`.
* Have **no database** dependency.

---

## 🎯 Decision

### Architectural Pattern — MVC (Model-View-Controller)
Chosen for its simplicity given the single-endpoint scope. The backend follows a lightweight MVC convention:
* **Model**: No persistence layer (stateless); the Telegram API is the only external system.
* **View**: Delegated entirely to the React SPA (separate `frontend/` directory).
* **Controller**: A single Express controller handles `POST /api/send-message`, invokes the service, and returns the response.

### Technology Stack

| Layer        | Technology               | Rationale                                         |
|--------------|--------------------------|---------------------------------------------------|
| Backend      | **Node.js 18+ / Express** | Lightweight, zero-overhead for a single endpoint |
| Frontend     | **React 18 + Vite**       | Fast dev server, modern tooling, easy `.env` via `import.meta.env` |
| Telegram SDK | **node-telegram-bot-api** | Official-compatible, well-maintained              |
| Styling      | **Plain CSS / CSS Modules** | Minimalist light design with no heavy framework overhead |
| CI/CD        | **Jenkins**               | Integrated with `https://github.com/jhee1995/telegram_messenger.git` |

### Repository Structure

```
telegram-messenger/
├── backend/               # Express MVC server
│   ├── src/
│   │   ├── config/        # env loader & validation
│   │   ├── controllers/   # sendMessageController
│   │   ├── routes/        # /api/send-message route
│   │   ├── services/      # telegramService (wraps Telegram API)
│   │   └── middlewares/   # CORS, rate-limiter, error handler
│   ├── .env.example
│   └── package.json
├── frontend/              # React + Vite SPA
│   ├── src/
│   │   ├── components/    # MessageForm, StatusBanner
│   │   ├── pages/         # HomePage
│   │   ├── services/      # api.js (fetch wrapper)
│   │   └── styles/        # global minimalist CSS
│   ├── .env.example
│   └── package.json
├── Project-specification/ # Architecture docs (this folder)
├── docs/adr/              # Architecture Decision Records
├── .jenkins/              # Jenkins pipeline helpers
├── Jenkinsfile
└── README.md
```

---

## ⚡ Consequences

### Positive
* Extremely low complexity — easy to onboard, maintain, and extend.
* No database migrations or schema management needed.
* `.env`-first approach ensures secrets never enter source control.
* Jenkins pipeline provides automated build/test/deploy on push.

### Negative / Trade-offs
* No authentication on the API endpoint — must be protected at the network/infrastructure level.
* Stateless: no message history or audit log persisted (acceptable for this use case).
* Scaling beyond a single endpoint would require revisiting the architecture (e.g., Modular Monolith or Microservices).

---

## 🔗 Related Decisions

* See [`Project-specification/decisions.yml`](../../Project-specification/decisions.yml) for the full locked decision registry.
* See [`Project-specification/security-requirements.md`](../../Project-specification/security-requirements.md) for the threat model.
