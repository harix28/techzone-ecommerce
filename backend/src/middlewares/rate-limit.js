const rateLimit = require('express-rate-limit');

const buildLimiter = (options) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });

module.exports = {
  apiLimiter: buildLimiter({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { success: false, message: 'Too many requests. Please try again shortly.' },
  }),
  authLimiter: buildLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many authentication attempts. Please wait and try again.' },
  }),
};
