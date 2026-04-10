const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toBool = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
};

const toList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const decodeMultiline = (value) => String(value || '').replace(/\\n/g, '\n').trim();

const decodeBase64 = (value) => {
  if (!value) {
    return '';
  }

  try {
    return Buffer.from(String(value), 'base64').toString('utf8').trim();
  } catch (error) {
    return '';
  }
};

const isVercel = process.env.VERCEL === '1';
const readRequired = (...keys) => {
  for (const key of keys) {
    const value = process.env[key];

    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }

  throw new Error(`Missing required environment variable: ${keys.join(' or ')}`);
};

const readOptional = (fallback, ...keys) => {
  for (const key of keys) {
    const value = process.env[key];

    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }

  return fallback;
};

const nodeEnv = process.env.NODE_ENV || (isVercel ? 'production' : 'development');
const sslMode = String(process.env.DB_SSL_MODE || '').trim().toLowerCase();
const sslCa = decodeBase64(process.env.DB_SSL_CA_BASE64) || decodeMultiline(process.env.DB_SSL_CA);
const sslEnabled =
  toBool(process.env.DB_SSL, false) || ['required', 'verify-ca', 'verify_identity'].includes(sslMode);
const rawCorsOrigins = isVercel
  ? readRequired('CORS_ORIGINS', 'FRONTEND_URLS', 'FRONTEND_URL')
  : readOptional('http://localhost:3000,http://localhost:5173', 'CORS_ORIGINS', 'FRONTEND_URLS', 'FRONTEND_URL');
const accessSecret = isVercel
  ? readRequired('JWT_ACCESS_SECRET', 'JWT_SECRET')
  : readOptional('change-me-access-secret', 'JWT_ACCESS_SECRET', 'JWT_SECRET');
const refreshSecret = isVercel
  ? readRequired('JWT_REFRESH_SECRET')
  : readOptional('change-me-refresh-secret', 'JWT_REFRESH_SECRET');
const dbHost = isVercel ? readRequired('DB_HOST') : readOptional('127.0.0.1', 'DB_HOST');
const dbName = isVercel ? readRequired('DB_NAME') : readOptional('techzone_ecommerce', 'DB_NAME');
const dbUser = isVercel ? readRequired('DB_USER') : readOptional('root', 'DB_USER');
const dbPassword = isVercel ? readRequired('DB_PASSWORD') : readOptional('', 'DB_PASSWORD');

module.exports = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: toInt(process.env.PORT, 5000),
  appName: process.env.APP_NAME || 'TechZone API',
  corsOrigins: toList(rawCorsOrigins),
  db: {
    host: dbHost,
    port: toInt(process.env.DB_PORT, 3306),
    name: dbName,
    user: dbUser,
    password: dbPassword,
    connectionLimit: toInt(process.env.DB_CONNECTION_LIMIT, 10),
    ssl: {
      enabled: sslEnabled,
      mode: sslMode || 'disabled',
      rejectUnauthorized: toBool(process.env.DB_SSL_REJECT_UNAUTHORIZED, true),
      ca: sslCa,
    },
  },
  auth: {
    accessSecret,
    refreshSecret,
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL || '30d',
    refreshCookieName: process.env.JWT_REFRESH_COOKIE_NAME || 'techzone_refresh_token',
  },
};
