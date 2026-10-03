'use strict';

describe('config module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('loads valid configuration when required environment variables are set', () => {
    process.env.PORT = '4000';
    process.env.FRONTEND_URL = 'http://test.frontend.com';
    process.env.TELEGRAM_BOT_TOKEN = 'token_test_123';
    process.env.TELEGRAM_API_URL = 'https://api.telegram.org';

    const config = require('../src/config/config');

    expect(config.server.port).toBe(4000);
    expect(config.cors.frontendUrl).toBe('http://test.frontend.com');
    expect(config.telegram.botToken).toBe('token_test_123');
    expect(config.telegram.apiUrl).toBe('https://api.telegram.org');
  });

  test('throws error when a required variable is missing', () => {
    delete process.env.TELEGRAM_BOT_TOKEN;

    expect(() => {
      require('../src/config/config');
    }).toThrow('Missing required environment variables');
  });

  test('throws error when TELEGRAM_API_URL is not allowlisted', () => {
    process.env.TELEGRAM_API_URL = 'https://malicious-api.com';

    expect(() => {
      require('../src/config/config');
    }).toThrow('TELEGRAM_API_URL "https://malicious-api.com" is not in the allowed list');
  });
});
