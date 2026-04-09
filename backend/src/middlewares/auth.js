const { one } = require('../config/database');
const ApiError = require('../utils/api-error');
const asyncHandler = require('../utils/async-handler');
const { verifyAccessToken } = require('../utils/tokens');
const { mapUser } = require('../models/user.model');

const loadCurrentUser = async (userId) =>
  one(
    `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.avatar_url,
        u.is_active,
        u.created_at,
        u.updated_at,
        r.role_key
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.id = ?
      LIMIT 1
    `,
    [userId],
  );

const resolveUserFromRequest = async (req) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return null;
  }

  try {
    const payload = verifyAccessToken(token);
    const userRow = await loadCurrentUser(payload.sub);

    if (!userRow || !userRow.is_active) {
      return null;
    }

    return mapUser(userRow);
  } catch (error) {
    return null;
  }
};

const requireAuth = asyncHandler(async (req, res, next) => {
  const user = await resolveUserFromRequest(req);

  if (!user) {
    throw new ApiError(401, 'Authentication required');
  }

  req.user = user;
  next();
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  req.user = await resolveUserFromRequest(req);
  next();
});

const requireRole = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action');
    }

    next();
  });

module.exports = {
  requireAuth,
  optionalAuth,
  requireRole,
};
