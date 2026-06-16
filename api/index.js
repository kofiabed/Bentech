// Vercel serverless entry point
// This file bridges the Express app to Vercel's serverless environment

// Load dotenv from the backend folder for local development compatibility
// On Vercel, env vars come from the Dashboard so dotenv is not needed
try {
  const path = require('path');
  require('dotenv').config({ path: path.resolve(__dirname, '..', 'backend', '.env') });
} catch (e) {
  // dotenv is optional on Vercel
}

const app = require('../backend/serverless');
module.exports = app;