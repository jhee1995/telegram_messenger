'use strict';

const telegramService = require('../services/telegramService');

/**
 * POST /api/send-message
 *
 * Validates the request body, delegates to the Telegram service,
 * and returns a uniform JSON response.
 *
 * Request body (application/json):
 *   { chatId: string, message: string }
 *
 * Success  200: { success: true,  messageId: number }
 * Error    400: { success: false, error: string }
 * Error    500: { success: false, error: string }
 */
async function sendMessage(req, res, next) {
  const { chatId, message } = req.body;

  // ── Input validation ──────────────────────────────────────────
  const errors = [];

  if (!chatId || typeof chatId !== 'string' || chatId.trim() === '') {
    errors.push('chatId is required and must be a non-empty string.');
  }

  if (!message || typeof message !== 'string' || message.trim() === '') {
    errors.push('message is required and must be a non-empty string.');
  }

  if (chatId && !/^-?\d+$/.test(chatId.trim())) {
    errors.push('chatId must be a numeric Telegram chat ID (e.g. "123456789").');
  }

  if (message && message.trim().length > 4096) {
    errors.push('message must not exceed 4096 characters (Telegram limit).');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: errors.join(' ') });
  }

  // ── Delegate to service ───────────────────────────────────────
  try {
    const { messageId } = await telegramService.sendMessage(
      chatId.trim(),
      message.trim()
    );
    return res.status(200).json({ success: true, messageId });
  } catch (err) {
    // Pass to the centralised error handler — do NOT expose raw err.message
    return next(err);
  }
}

module.exports = { sendMessage };
