'use strict';

/**
 * Unit tests for sendMessageController
 *
 * [TEST DATA FIXTURE] — all chatId / message values are synthetic test data.
 * The Telegram service is mocked — no real API calls are made.
 */

// Mock the service before requiring the controller
jest.mock('../src/services/telegramService', () => ({
  sendMessage: jest.fn(),
}));

const telegramService = require('../src/services/telegramService');
const { sendMessage } = require('../src/controllers/sendMessageController');

// Minimal Express req/res/next mocks
function buildRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('sendMessageController', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = buildRes();
    next = jest.fn();
    jest.clearAllMocks();
  });

  // ── Happy path ───────────────────────────────────────────────
  test('200 — valid chatId and message', async () => {
    // [TEST DATA FIXTURE]
    req.body = { chatId: '123456789', message: 'Hello, world!' };
    telegramService.sendMessage.mockResolvedValue({ messageId: 42 });

    await sendMessage(req, res, next);

    expect(telegramService.sendMessage).toHaveBeenCalledWith(
      '123456789',
      'Hello, world!'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, messageId: 42 });
    expect(next).not.toHaveBeenCalled();
  });

  // ── Validation errors (400) ──────────────────────────────────
  test('400 — missing chatId', async () => {
    req.body = { message: 'Hello' };
    await sendMessage(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('400 — missing message', async () => {
    req.body = { chatId: '123456789' };
    await sendMessage(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('400 — empty chatId string', async () => {
    req.body = { chatId: '   ', message: 'Hello' };
    await sendMessage(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('400 — non-numeric chatId', async () => {
    // [TEST DATA FIXTURE]
    req.body = { chatId: 'not-a-number', message: 'Hello' };
    await sendMessage(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: expect.stringContaining('numeric') })
    );
  });

  test('400 — message exceeds 4096 chars', async () => {
    req.body = { chatId: '123456789', message: 'a'.repeat(4097) };
    await sendMessage(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: expect.stringContaining('4096') })
    );
  });

  // ── Service error → next() ────────────────────────────────────
  test('calls next(err) when telegramService throws', async () => {
    req.body = { chatId: '123456789', message: 'Hello' };
    const serviceError = new Error('Telegram API unreachable');
    telegramService.sendMessage.mockRejectedValue(serviceError);

    await sendMessage(req, res, next);

    expect(next).toHaveBeenCalledWith(serviceError);
    expect(res.status).not.toHaveBeenCalled();
  });

  // ── Negative chatId (group chats have negative IDs) ──────────
  test('200 — negative chatId (group chat)', async () => {
    // [TEST DATA FIXTURE]
    req.body = { chatId: '-100123456789', message: 'Group message' };
    telegramService.sendMessage.mockResolvedValue({ messageId: 77 });

    await sendMessage(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, messageId: 77 });
  });
});
