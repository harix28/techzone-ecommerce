const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const nodeEnv = process.env.NODE_ENV || 'development';

module.exports = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: toInt(process.env.PORT, 5000),
  appName: process.env.APP_NAME || 'TechZone API',
  corsOrigins: toList(
    process.env.CORS_ORIGINS ||
      process.env.FRONTEND_URLS ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000,http://localhost:5173',
  ),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: toInt(process.env.DB_PORT, 3306),
    name: process.env.DB_NAME || 'techzone_ecommerce',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    connectionLimit: toInt(process.env.DB_CONNECTION_LIMIT, 10),
  },
  auth: {
    accessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'change-me-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh-secret',
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL || '30d',
    refreshCookieName: process.env.JWT_REFRESH_COOKIE_NAME || 'techzone_refresh_token',
  },
};
