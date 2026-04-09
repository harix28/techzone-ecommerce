const { execute, one, query } = require('../config/database');
const { buildPaginationMeta, parsePagination } = require('../utils/pagination');
const ApiError = require('../utils/api-error');
const { hashPassword } = require('../utils/security');
const { mapAddress, mapUser } = require('../models/user.model');

const getUserRow = (userId, connection) =>
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

const listUserAddresses = async (userId, connection) => {
  const rows = await query(
    `
      SELECT *
      FROM addresses
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `,
    [userId],
    connection,
  );

  return rows.map(mapAddress);
};

const getProfile = async (userId) => {
  const userRow = await getUserRow(userId);

  if (!userRow) {
    throw new ApiError(404, 'User not found');
  }

  return {
    ...mapUser(userRow),
    addresses: await listUserAddresses(userId),
  };
};

const updateProfile = async (userId, payload) => {
  const userRow = await getUserRow(userId);

  if (!userRow) {
    throw new ApiError(404, 'User not found');
  }

  const updates = [payload.name, payload.phone || null, payload.avatar || null];
  let passwordClause = '';

  if (payload.password) {
    passwordClause = ', password_hash = ?';
    updates.push(await hashPassword(payload.password));
  }

  updates.push(userId);

  await execute(
    `
      UPDATE users
      SET full_name = ?, phone = ?, avatar_url = ?${passwordClause}
      WHERE id = ?
    `,
    updates,
  );

  return getProfile(userId);
};

const createAddress = async (userId, payload) => {
  if (payload.isDefault) {
    await execute('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
  }

  const existingAddress = await one('SELECT COUNT(*) AS total FROM addresses WHERE user_id = ?', [userId]);
  const isDefault = payload.isDefault || Number(existingAddress?.total || 0) === 0;
  const result = await execute(
    `
      INSERT INTO addresses (
        user_id,
        label,
        full_name,
        phone,
        line1,
        line2,
        city,
        state,
        postal_code,
        country,
        is_default
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      payload.label,
      payload.fullName,
      payload.phone,
      payload.line1,
      payload.line2 || null,
      payload.city,
      payload.state,
      payload.postalCode,
      payload.country,
      isDefault,
    ],
  );

  return getAddressById(userId, result.insertId);
};

const getAddressById = async (userId, addressId, connection) => {
  const row = await one(
    `
      SELECT *
      FROM addresses
      WHERE id = ? AND user_id = ?
      LIMIT 1
    `,
    [addressId, userId],
    connection,
  );

  if (!row) {
    throw new ApiError(404, 'Address not found');
  }

  return mapAddress(row);
};

const updateAddress = async (userId, addressId, payload) => {
  await getAddressById(userId, addressId);

  if (payload.isDefault) {
    await execute('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
  }

  await execute(
    `
      UPDATE addresses
      SET
        label = ?,
        full_name = ?,
        phone = ?,
        line1 = ?,
        line2 = ?,
        city = ?,
        state = ?,
        postal_code = ?,
        country = ?,
        is_default = ?
      WHERE id = ? AND user_id = ?
    `,
    [
      payload.label,
      payload.fullName,
      payload.phone,
      payload.line1,
      payload.line2 || null,
      payload.city,
      payload.state,
      payload.postalCode,
      payload.country,
      payload.isDefault,
      addressId,
      userId,
    ],
  );

  return getAddressById(userId, addressId);
};

const deleteAddress = async (userId, addressId) => {
  const address = await getAddressById(userId, addressId);
  await execute('DELETE FROM addresses WHERE id = ? AND user_id = ?', [addressId, userId]);

  if (address.isDefault) {
    const fallbackAddress = await one(
      'SELECT id FROM addresses WHERE user_id = ? ORDER BY created_at ASC LIMIT 1',
      [userId],
    );

    if (fallbackAddress) {
      await execute('UPDATE addresses SET is_default = TRUE WHERE id = ?', [fallbackAddress.id]);
    }
  }

  return address;
};

const listUsers = async (queryParams = {}) => {
  const { page, pageSize, offset } = parsePagination(queryParams, { pageSize: 20, maxPageSize: 50 });
  const search = String(queryParams.search || '').trim();
  const params = [];
  const conditions = [];

  if (search) {
    conditions.push('(u.full_name LIKE ? OR u.email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [totalRow, rows] = await Promise.all([
    one(
      `
        SELECT COUNT(*) AS total
        FROM users u
        ${where}
      `,
      params,
    ),
    query(
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
        ${where}
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
      `,
      [...params, pageSize, offset],
    ),
  ]);

  return {
    items: rows.map(mapUser),
    meta: buildPaginationMeta(Number(totalRow?.total || 0), page, pageSize),
  };
};

const updateUser = async (userId, payload) => {
  const user = await getUserRow(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  let roleId = null;

  if (payload.roleKey) {
    const role = await one('SELECT id FROM roles WHERE role_key = ? LIMIT 1', [payload.roleKey]);

    if (!role) {
      throw new ApiError(400, 'Selected role is invalid');
    }

    roleId = role.id;
  } else if (payload.roleId) {
    roleId = payload.roleId;
  } else {
    const currentRole = await one('SELECT id FROM roles WHERE role_key = ? LIMIT 1', [user.role]);
    roleId = currentRole?.id;
  }

  await execute(
    `
      UPDATE users
      SET role_id = ?, is_active = ?
      WHERE id = ?
    `,
    [roleId, payload.isActive, userId],
  );

  return getProfile(userId);
};

module.exports = {
  getProfile,
  updateProfile,
  listUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getAddressById,
  listUsers,
  updateUser,
};
