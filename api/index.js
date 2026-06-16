// Vercel serverless entry point
// This file bridges the Express app to Vercel's serverless environment
const app = require('../backend/serverless');
module.exports = app;