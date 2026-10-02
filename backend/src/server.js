'use strict';

const createApp = require('./app');
const config = require('./config/config');

const app = createApp();

const server = app.listen(config.server.port, () => {
  // Intentionally only log non-sensitive startup info
  console.log(
    `[server] telegram-messenger backend running on port ${config.server.port} ` +
      `[${config.server.nodeEnv}]`
  );
  console.log(`[server] CORS allowed origin: ${config.cors.frontendUrl}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[server] SIGTERM received — shutting down gracefully');
  server.close(() => {
    console.log('[server] HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[server] SIGINT received — shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

module.exports = server; // Exported for integration tests
