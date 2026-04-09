const asyncHandler = require('../utils/async-handler');
const env = require('../config/env');
const { refreshCookieOptions } = require('../utils/tokens');
const { validateLoginPayload, validateRegisterPayload } = require('../validators/auth.validator');
const authService = require('../services/auth.service');

const getMeta = (req) => ({
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'] || '',
});

const setRefreshCookie = (res, refreshToken) => {
  res.cookie(env.auth.refreshCookieName, refreshToken, refreshCookieOptions());
};

const clearRefreshCookie = (res) => {
  res.clearCookie(env.auth.refreshCookieName, refreshCookieOptions());
};

exports.register = asyncHandler(async (req, res) => {
  const session = await authService.register(validateRegisterPayload(req.body), getMeta(req));
  setRefreshCookie(res, session.refreshToken);

  res.status(201).json({
    success: true,
    data: {
      user: session.user,
      accessToken: session.accessToken,
    },
    message: 'Account created successfully',
  });
});

exports.login = asyncHandler(async (req, res) => {
  const session = await authService.login(validateLoginPayload(req.body), getMeta(req));
  setRefreshCookie(res, session.refreshToken);

  res.json({
    success: true,
    data: {
      user: session.user,
      accessToken: session.accessToken,
    },
    message: 'Signed in successfully',
  });
});

exports.refresh = asyncHandler(async (req, res) => {
  const session = await authService.refresh(req.cookies?.[env.auth.refreshCookieName], getMeta(req));
  setRefreshCookie(res, session.refreshToken);

  res.json({
    success: true,
    data: {
      user: session.user,
      accessToken: session.accessToken,
    },
  });
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies?.[env.auth.refreshCookieName]);
  clearRefreshCookie(res);
  res.json({ success: true, message: 'Signed out successfully' });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  res.json({ success: true, data: user });
});
