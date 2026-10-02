'use strict';

const rateLimit = require('express-rate-limit');
const config = require('../config/config');

/**
 * Rate limiter for POST /api/send-message.
 * Defaults (configurable via .env):
 *   RATE_LIMIT_MAX         = 20 requests
 *   RATE_LIMIT_WINDOW_MS   = 60000 ms (1 minute)
 */
const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,   // Return rate-limit info in the `RateLimit-*` headers
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please wait before sending another message.',
  },
});

module.exports = rateLimiter;
