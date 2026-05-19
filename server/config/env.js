const path = require('path');
const dotenvResult = require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

if (dotenvResult.error) {
  // It's okay if .env is not present in production; use environment variables from the host.
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ server/.env not found; falling back to process.env values.');
  }
}

const getEnv = (key, fallback = undefined, required = false) => {
  const value = process.env[key];
  if (value !== undefined && value !== null && String(value).trim() !== '') {
    return String(value).trim();
  }
  if (required && process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ Missing required environment variable: ${key}. Using fallback: ${fallback}`);
  }
  return fallback;
};

const stripTrailingSlash = (value) =>
  typeof value === 'string' ? value.replace(/\/+$|\?$/, '') : value;

module.exports = {
  PORT: Number(getEnv('PORT', 5000)),
  MONGO_URI: getEnv('MONGO_URI', 'mongodb://localhost:27017/dsa-platform'),
  ML_SERVICE_URL: stripTrailingSlash(getEnv('ML_SERVICE_URL', 'http://localhost:8000')),
};
