'use strict';

const TelegramBot = require('node-telegram-bot-api');
const config = require('../config/config');

/**
 * Lazily-initialised Telegram bot instance.
 * Using polling:false because we only need to send messages (no incoming updates).
 */
let _bot = null;

/**
 * Returns (and lazily creates) the shared TelegramBot instance.
 * Extracted for testability — tests can call getBot() and check its state.
 * @returns {TelegramBot}
 */
function getBot() {
  if (!_bot) {
    _bot = new TelegramBot(config.telegram.botToken, {
      polling: false,
      baseApiUrl: config.telegram.apiUrl,
    });
  }
  return _bot;
}

/**
 * Sends a text message to the specified Telegram chat.
 *
 * @param {string} chatId  - The recipient's Telegram chat ID (numeric string).
 * @param {string} message - The text content to send.
 * @returns {Promise<{ messageId: number }>} Resolves with the sent message ID.
 * @throws {Error} Propagates Telegram API errors with a sanitised message.
 */
async function sendMessage(chatId, message) {
  const bot = getBot();

  let result;
  try {
    result = await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  } catch (err) {
    // Sanitise: strip any token reference from the error before propagating
    const safeMessage = (err.message || 'Telegram API error').replace(
      /bot\d+:[A-Za-z0-9_-]+/g,
      '[REDACTED]'
    );
    throw new Error(safeMessage);
  }

  return { messageId: result.message_id };
}

module.exports = { sendMessage, getBot };
