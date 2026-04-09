const { execute, one, query } = require('../config/database');
const { mapCategory } = require('../models/category.model');
const ApiError = require('../utils/api-error');

const listCategories = async ({ includeInactive = false } = {}) => {
  const rows = await query(
    `
      SELECT *
      FROM categories
      ${includeInactive ? '' : 'WHERE is_active = TRUE'}
      ORDER BY display_order ASC, name ASC
    `,
  );

  return rows.map(mapCategory);
};

const createCategory = async (payload) => {
  try {
    const result = await execute(
      `
        INSERT INTO categories (name, slug, icon, description, display_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        payload.name,
        payload.slug,
        payload.icon || null,
        payload.description || null,
        payload.displayOrder,
        payload.isActive,
      ],
    );

    return getCategoryById(result.insertId, true);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new ApiError(409, 'Category name or slug already exists');
    }

    throw error;
  }
};

const getCategoryById = async (id, includeInactive = false) => {
  const row = await one(
    `
      SELECT *
      FROM categories
      WHERE id = ? ${includeInactive ? '' : 'AND is_active = TRUE'}
      LIMIT 1
    `,
    [id],
  );

  if (!row) {
    throw new ApiError(404, 'Category not found');
  }

  return mapCategory(row);
};

const updateCategory = async (id, payload) => {
  const existing = await one('SELECT id FROM categories WHERE id = ? LIMIT 1', [id]);

  if (!existing) {
    throw new ApiError(404, 'Category not found');
  }

  try {
    await execute(
      `
        UPDATE categories
        SET name = ?, slug = ?, icon = ?, description = ?, display_order = ?, is_active = ?
        WHERE id = ?
      `,
      [
        payload.name,
        payload.slug,
        payload.icon || null,
        payload.description || null,
        payload.displayOrder,
        payload.isActive,
        id,
      ],
    );

    return getCategoryById(id, true);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new ApiError(409, 'Category name or slug already exists');
    }

    throw error;
  }
};

const deleteCategory = async (id) => {
  const category = await getCategoryById(id, true);

  await execute('UPDATE categories SET is_active = FALSE WHERE id = ?', [id]);

  return category;
};

module.exports = {
  listCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
