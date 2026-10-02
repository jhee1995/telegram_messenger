'use strict';

const express = require('express');
const corsMiddleware = require('./middlewares/cors');
const errorHandler = require('./middlewares/errorHandler');
const sendMessageRouter = require('./routes/sendMessage');

/**
 * Creates and configures the Express application.
 * Separated from server.js so the app can be imported in tests
 * without binding to a port.
 *
 * @returns {import('express').Application}
 */
function createApp() {
  const app = express();

  // ── Global middlewares ──────────────────────────────────────
  app.use(corsMiddleware);
  app.use(express.json({ limit: '16kb' }));

  // ── Health check (no rate-limit — used by Jenkins / load-balancer) ──
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // ── API routes ──────────────────────────────────────────────
  app.use('/api', sendMessageRouter);

  // ── 404 handler ─────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found.' });
  });

  // ── Centralised error handler (must be last) ─────────────────
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
