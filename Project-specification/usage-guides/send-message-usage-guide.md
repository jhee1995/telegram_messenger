# Backend Usage Guide — `POST /api/send-message`

## Endpoint

```
POST http://localhost:3001/api/send-message
Content-Type: application/json
```

---

## Request Body

| Field     | Type   | Required | Constraints                                            |
|-----------|--------|----------|--------------------------------------------------------|
| `chatId`  | string | ✅       | Numeric Telegram chat ID (positive or negative integer) |
| `message` | string | ✅       | 1–4096 characters                                      |

### Example — personal chat

```json
{
  "chatId": "123456789",
  "message": "Hello from telegram-messenger! 👋"
}
```

### Example — group/channel (negative ID)

```json
{
  "chatId": "-100987654321",
  "message": "Group announcement"
}
```

---

## Success Response `200 OK`

```json
{
  "success": true,
  "messageId": 42
}
```

---

## Error Responses

### `400 Bad Request` — Validation failure

```json
{
  "success": false,
  "error": "chatId must be a numeric Telegram chat ID (e.g. \"123456789\")."
}
```

### `429 Too Many Requests` — Rate limit hit

```json
{
  "success": false,
  "error": "Too many requests. Please wait before sending another message."
}
```

### `500 Internal Server Error` — Telegram API failure

```json
{
  "success": false,
  "error": "An unexpected error occurred. Please try again."
}
```

---

## How to Find Your Chat ID

1. Open Telegram and search for **@userinfobot**.
2. Send any message to it — it replies with your numeric chat ID.
3. For groups, add **@userinfobot** to the group; it will report the group's (negative) chat ID.

---

## Running the Backend

```bash
cd backend
cp .env.example .env        # Fill in TELEGRAM_BOT_TOKEN
npm run dev                 # Starts with nodemon on PORT (default: 3001)
```

## Running Tests

```bash
cd backend
npm test                    # Jest — 8 unit tests, no network calls
```

## Health Check

```
GET http://localhost:3001/health
→ 200 { "status": "ok" }
```
