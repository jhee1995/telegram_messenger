'use strict';

const { Router } = require('express');
const rateLimiter = require('../middlewares/rateLimiter');
const { sendMessage } = require('../controllers/sendMessageController');

const router = Router();

/**
 * POST /api/send-message
 *
 * Body: { chatId: string, message: string }
 *
 * Rate-limited per IP to protect against abuse.
 */
router.post('/send-message', rateLimiter, sendMessage);

module.exports = router;
