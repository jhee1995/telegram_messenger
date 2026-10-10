'use strict';

/**
 * Vercel Serverless Function entry point.
 *
 * Imports and initialises the Express application without binding to a network port.
 * Vercel automatically passes HTTP requests into the exported Express app handler.
 */
const createApp = require('../backend/src/app');

const app = createApp();

module.exports = app;
