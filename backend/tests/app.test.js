'use strict';

const request = require('supertest');

jest.mock('../src/services/telegramService', () => ({
  sendMessage: jest.fn(),
  getBot: jest.fn(),
}));

const telegramService = require('../src/services/telegramService');
const createApp = require('../src/app');

describe('App Endpoints & Middleware', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createApp();
  });

  describe('GET /health', () => {
    test('returns 200 with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('404 Handler', () => {
    test('returns 404 for unknown routes', async () => {
      const res = await request(app).get('/api/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ success: false, error: 'Route not found.' });
    });
  });

  describe('POST /api/send-message (via App)', () => {
    test('returns 200 on successful message send', async () => {
      telegramService.sendMessage.mockResolvedValue({ messageId: 999 });

      const res = await request(app)
        .post('/api/send-message')
        .send({ chatId: '12345678', message: 'Integration test message' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, messageId: 999 });
    });

    test('returns 400 on invalid input', async () => {
      const res = await request(app)
        .post('/api/send-message')
        .send({ chatId: '', message: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('returns 500 when service throws unexpected error', async () => {
      telegramService.sendMessage.mockRejectedValue(new Error('Internal failure'));

      const res = await request(app)
        .post('/api/send-message')
        .send({ chatId: '12345678', message: 'Will fail' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});
