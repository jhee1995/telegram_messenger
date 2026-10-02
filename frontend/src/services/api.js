/**
 * API service — thin fetch wrapper for the Express backend.
 *
 * The backend URL is injected exclusively from the VITE_BACKEND_URL
 * environment variable (.env) — no hardcoded URLs anywhere.
 */

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

if (!BASE_URL) {
  throw new Error(
    '[api] VITE_BACKEND_URL is not defined. ' +
      'Copy frontend/.env.example to frontend/.env and set a value.'
  );
}

/**
 * @typedef {Object} SendMessagePayload
 * @property {string} chatId   - Numeric Telegram chat ID
 * @property {string} message  - Text to send (1-4096 chars)
 */

/**
 * @typedef {Object} SendMessageResult
 * @property {boolean} success
 * @property {number}  [messageId]
 * @property {string}  [error]
 */

/**
 * Sends a Telegram message via the backend API.
 *
 * @param {SendMessagePayload} payload
 * @returns {Promise<SendMessageResult>}
 */
export async function sendMessage({ chatId, message }) {
  const response = await fetch(`${BASE_URL}/api/send-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  });

  const data = await response.json();
  return data;
}
