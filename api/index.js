// Vercel serverless function wrapper for Express app
const app = require('../dist/src/app').app;

module.exports = app;
