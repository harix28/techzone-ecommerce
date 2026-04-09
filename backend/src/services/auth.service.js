const env = require('../config/env');
const { execute, one, withTransaction } = require('../config/database');
const { mapUser } = require('../models/user.model');
const ApiError = require('../utils/api-error');
const { comparePassword, hashPassword, hashToken } = require('../utils/security');
const {
  durationToMs,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/tokens');

const getUserByEmail = (email, connection) =>
  one(
    `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.password_hash,
        u.phone,
        u.avatar_url,
        u.is_active,
        u.created_at,
        u.updated_at,
        r.role_key
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.email = ?
      LIMIT 1
    `,
    [email],
    connection,
  );

const getUserById = (userId, connection) =>
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
    connection,
  );

const createSession = async (userRow, meta = {}, connection) => {
  const user = mapUser(userRow);
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const expiresAt = new Date(Date.now() + durationToMs(env.auth.refreshTtl));

  await execute(
    `
      INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip_address, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      user.id,
      hashToken(refreshToken),
      meta.userAgent || '',
      meta.ipAddress || '',
      expiresAt,
    ],
    connection,
  );

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const register = async (payload, meta = {}) =>
  withTransaction(async (connection) => {
    const existingUser = await getUserByEmail(payload.email, connection);

    if (existingUser) {
      throw new ApiError(409, 'Email is already registered');
    }

    const role = await one('SELECT id FROM roles WHERE role_key = ? LIMIT 1', ['customer'], connection);

    if (!role) {
      throw new ApiError(500, 'Customer role is not configured');
    }

    const passwordHash = await hashPassword(payload.password);
    const result = await execute(
      `
        INSERT INTO users (role_id, full_name, email, password_hash, phone)
        VALUES (?, ?, ?, ?, ?)
      `,
      [role.id, payload.name, payload.email, passwordHash, payload.phone || null],
      connection,
    );

    await execute('INSERT INTO carts (user_id) VALUES (?)', [result.insertId], connection);
    await execute('INSERT INTO wishlists (user_id) VALUES (?)', [result.insertId], connection);

    const userRow = await getUserById(result.insertId, connection);
    return createSession(userRow, meta, connection);
  });

const login = async (payload, meta = {}) =>
  withTransaction(async (connection) => {
    const userRow = await getUserByEmail(payload.email, connection);

    if (!userRow || !(await comparePassword(payload.password, userRow.password_hash))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (!userRow.is_active) {
      throw new ApiError(403, 'This account has been deactivated');
    }

    await execute('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [userRow.id], connection);

    return createSession(userRow, meta, connection);
  });

const refresh = async (refreshToken, meta = {}) =>
  withTransaction(async (connection) => {
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token is required');
    }

    let payload;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new ApiError(401, 'Refresh token is invalid or expired');
    }

    const storedToken = await one(
      `
        SELECT id, user_id, revoked_at, expires_at
        FROM refresh_tokens
        WHERE token_hash = ?
        LIMIT 1
      `,
      [hashToken(refreshToken)],
      connection,
    );

    if (!storedToken || storedToken.revoked_at || new Date(storedToken.expires_at) < new Date()) {
      throw new ApiError(401, 'Refresh token session is no longer valid');
    }

    const userRow = await getUserById(payload.sub, connection);

    if (!userRow || !userRow.is_active) {
      throw new ApiError(401, 'User account is unavailable');
    }

    await execute('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?', [storedToken.id], connection);

    return createSession(userRow, meta, connection);
  });

const logout = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  await execute(
    'UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ? AND revoked_at IS NULL',
    [hashToken(refreshToken)],
  );
};

const getCurrentUser = async (userId) => {
  const userRow = await getUserById(userId);

  if (!userRow) {
    throw new ApiError(404, 'User not found');
  }

  return mapUser(userRow);
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
};
