'use strict';

const cors = require('cors');
const config = require('../config/config');

/**
 * CORS middleware.
 * Allows requests only from the origin declared in FRONTEND_URL (.env).
 * No wildcard '*' is ever used.
 */
const corsMiddleware = cors({
  origin: config.cors.frontendUrl,
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 204,
});

module.exports = corsMiddleware;
