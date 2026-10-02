'use strict';

/**
 * Centralised Express error handler.
 * Must be registered LAST in the middleware chain (4-argument signature).
 *
 * - Never exposes raw stack traces to the client in production.
 * - Never leaks the Telegram bot token (sanitised in telegramService).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const isDev = process.env.NODE_ENV !== 'production';

  // Log server-side with full context (token already redacted by service layer)
  console.error('[errorHandler]', {
    method: req.method,
    path: req.path,
    message: err.message,
    ...(isDev && { stack: err.stack }),
  });

  const status = err.statusCode || err.status || 500;

  return res.status(status).json({
    success: false,
    error:
      isDev
        ? err.message || 'An unexpected error occurred.'
        : 'An unexpected error occurred. Please try again.',
  });
}

module.exports = errorHandler;
