'use strict';

const mockSendMessage = jest.fn();

jest.mock('node-telegram-bot-api', () => {
  return jest.fn().mockImplementation(() => ({
    sendMessage: mockSendMessage,
  }));
});

const telegramService = require('../src/services/telegramService');

describe('telegramService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getBot returns TelegramBot instance', () => {
    const bot = telegramService.getBot();
    expect(bot).toBeDefined();
    expect(typeof bot.sendMessage).toBe('function');
  });

  test('sendMessage successfully sends message and returns messageId', async () => {
    mockSendMessage.mockResolvedValueOnce({ message_id: 12345 });

    const result = await telegramService.sendMessage('987654321', 'Hello Test');

    expect(result).toEqual({ messageId: 12345 });
    expect(mockSendMessage).toHaveBeenCalledWith(
      '987654321',
      'Hello Test',
      { parse_mode: 'HTML' }
    );
  });

  test('sendMessage redacts bot token in error message', async () => {
    mockSendMessage.mockRejectedValueOnce(
      new Error('Failed request to bot123456:ABC-DEF_xyz: not found')
    );

    await expect(
      telegramService.sendMessage('987654321', 'Hello Test')
    ).rejects.toThrow('[REDACTED]');
  });

  test('sendMessage uses fallback message if err.message is empty', async () => {
    mockSendMessage.mockRejectedValueOnce({});

    await expect(
      telegramService.sendMessage('987654321', 'Hello Test')
    ).rejects.toThrow('Telegram API error');
  });
});
