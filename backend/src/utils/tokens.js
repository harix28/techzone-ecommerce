const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
      type: 'access',
    },
    env.auth.accessSecret,
    { expiresIn: env.auth.accessTtl },
  );

const signRefreshToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role,
      type: 'refresh',
    },
    env.auth.refreshSecret,
    { expiresIn: env.auth.refreshTtl },
  );

const verifyAccessToken = (token) => jwt.verify(token, env.auth.accessSecret);
const verifyRefreshToken = (token) => jwt.verify(token, env.auth.refreshSecret);

const durationToMs = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  const match = normalized.match(/^(\d+)([smhd])$/);

  if (!match) {
    return 1000 * 60 * 60 * 24 * 30;
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers = {
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
  };

  return amount * multipliers[unit];
};

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  path: '/api/auth',
  maxAge: durationToMs(env.auth.refreshTtl),
});

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  durationToMs,
  refreshCookieOptions,
};
