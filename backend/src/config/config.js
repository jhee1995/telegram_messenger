'use strict';

require('dotenv').config();

/**
 * Centralised configuration loader.
 * All values are sourced exclusively from environment variables.
 * Any missing required variable causes a loud startup failure.
 */

const REQUIRED = [
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_API_URL',
  'PORT',
  'FRONTEND_URL',
];

const TELEGRAM_API_ALLOWLIST = ['https://api.telegram.org'];

/**
 * Validate that all required env vars are present and non-empty.
 * @throws {Error} if any required variable is missing.
 */
function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[config] Missing required environment variables: ${missing.join(', ')}. ` +
        'Copy backend/.env.example to backend/.env and fill in all values.'
    );
  }

  // SSRF guard: TELEGRAM_API_URL must be in the allowlist
  const apiUrl = process.env.TELEGRAM_API_URL.replace(/\/$/, '');
  if (!TELEGRAM_API_ALLOWLIST.includes(apiUrl)) {
    throw new Error(
      `[config] TELEGRAM_API_URL "${apiUrl}" is not in the allowed list: ${TELEGRAM_API_ALLOWLIST.join(', ')}`
    );
  }
}

validateEnv();

const config = {
  server: {
    port: parseInt(process.env.PORT, 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  cors: {
    frontendUrl: process.env.FRONTEND_URL,
  },
  telegram: {
    /** Never log this value */
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    apiUrl: process.env.TELEGRAM_API_URL.replace(/\/$/, ''),
  },
  rateLimit: {
    /** Requests per windowMs per IP */
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '20', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  },
};

module.exports = config;
