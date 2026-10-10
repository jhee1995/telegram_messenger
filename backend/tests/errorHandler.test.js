'use strict';

const errorHandler = require('../src/middlewares/errorHandler');

describe('errorHandler middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { method: 'POST', path: '/api/send-message' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('handles custom status and development error details', () => {
    process.env.NODE_ENV = 'development';
    const err = new Error('Custom failure');
    err.statusCode = 400;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Custom failure',
    });
  });

  test('handles production mode with generic message', () => {
    process.env.NODE_ENV = 'production';
    const err = new Error('Sensitive database error');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    });
  });

  test('falls back to 500 when err has no status', () => {
    process.env.NODE_ENV = 'test';
    const err = {};

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'An unexpected error occurred.',
    });
  });
});
