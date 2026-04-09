const { execute, one, query, withTransaction } = require('../config/database');
const { mapProduct } = require('../models/product.model');
const { buildPaginationMeta, parsePagination } = require('../utils/pagination');
const ApiError = require('../utils/api-error');

const buildProductFilters = (filters = {}, { adminView = false } = {}) => {
  const conditions = [];
  const params = [];

  if (!adminView) {
    conditions.push('p.is_active = TRUE');
  }

  if (filters.search) {
    const search = String(filters.search).trim();

    if (search.length >= 3) {
      conditions.push(
        '(MATCH(p.name, p.short_description, p.description, p.brand, p.search_keywords) AGAINST (? IN BOOLEAN MODE) OR p.name LIKE ? OR p.brand LIKE ? OR p.sku LIKE ?)',
      );
      params.push(`${search}*`, `%${search}%`, `%${search}%`, `%${search}%`);
    } else {
      conditions.push('(p.name LIKE ? OR p.brand LIKE ? OR p.sku LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
  }

  if (filters.category) {
    if (/^\d+$/.test(String(filters.category))) {
      conditions.push('p.category_id = ?');
      params.push(Number(filters.category));
    } else {
      conditions.push('c.slug = ?');
      params.push(String(filters.category));
    }
  }

  if (filters.brand) {
    conditions.push('p.brand LIKE ?');
    params.push(`%${filters.brand}%`);
  }

  if (filters.featured !== undefined) {
    conditions.push('p.is_featured = ?');
    params.push(String(filters.featured) === 'true' || filters.featured === true || Number(filters.featured) === 1);
  }

  if (filters.isActive !== undefined) {
    conditions.push('p.is_active = ?');
    params.push(String(filters.isActive) === 'true' || filters.isActive === true || Number(filters.isActive) === 1);
  }

  if (filters.minPrice !== undefined && filters.minPrice !== '') {
    conditions.push('p.price >= ?');
    params.push(Number(filters.minPrice));
  }

  if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
    conditions.push('p.price <= ?');
    params.push(Number(filters.maxPrice));
  }

  return {
    where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
};

const buildSortClause = (sort) => {
  switch (sort) {
    case 'price_asc':
      return 'ORDER BY p.price ASC, p.created_at DESC';
    case 'price_desc':
      return 'ORDER BY p.price DESC, p.created_at DESC';
    case 'rating':
      return 'ORDER BY p.rating_average DESC, p.rating_count DESC, p.created_at DESC';
    case 'popular':
      return 'ORDER BY p.sold_count DESC, p.created_at DESC';
    case 'name_asc':
      return 'ORDER BY p.name ASC';
    default:
      return 'ORDER BY p.created_at DESC';
  }
};

const productSelect = `
  SELECT
    p.id,
    p.category_id,
    p.name,
    p.slug,
    p.sku,
    p.brand,
    p.short_description,
    p.description,
    p.price,
    p.compare_at_price,
    p.currency,
    p.stock_quantity,
    p.low_stock_threshold,
    p.rating_average,
    p.rating_count,
    p.sold_count,
    p.is_featured,
    p.is_active,
    p.warranty,
    p.created_at,
    p.updated_at,
    c.name AS category_name,
    c.slug AS category_slug,
    c.icon AS category_icon,
    COALESCE(
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pi.id,
            'imageUrl', pi.image_url,
            'altText', COALESCE(pi.alt_text, ''),
            'sortOrder', pi.sort_order
          )
        )
        FROM product_images pi
        WHERE pi.product_id = p.id
        ORDER BY pi.sort_order ASC
      ),
      JSON_ARRAY()
    ) AS images_json,
    COALESCE(
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'featureText', pf.feature_text,
            'sortOrder', pf.sort_order
          )
        )
        FROM product_features pf
        WHERE pf.product_id = p.id
        ORDER BY pf.sort_order ASC
      ),
      JSON_ARRAY()
    ) AS features_json,
    COALESCE(
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'key', ps.spec_key,
            'value', ps.spec_value,
            'sortOrder', ps.sort_order
          )
        )
        FROM product_specs ps
        WHERE ps.product_id = p.id
        ORDER BY ps.sort_order ASC
      ),
      JSON_ARRAY()
    ) AS specifications_json
  FROM products p
  INNER JOIN categories c ON c.id = p.category_id
`;

const syncProductRelations = async (connection, productId, payload) => {
  await execute('DELETE FROM product_images WHERE product_id = ?', [productId], connection);
  await execute('DELETE FROM product_features WHERE product_id = ?', [productId], connection);
  await execute('DELETE FROM product_specs WHERE product_id = ?', [productId], connection);

  for (const image of payload.images) {
    await execute(
      `
        INSERT INTO product_images (product_id, image_url, alt_text, sort_order)
        VALUES (?, ?, ?, ?)
      `,
      [productId, image.imageUrl, image.altText, image.sortOrder],
      connection,
    );
  }

  for (const feature of payload.features) {
    await execute(
      `
        INSERT INTO product_features (product_id, feature_text, sort_order)
        VALUES (?, ?, ?)
      `,
      [productId, feature.featureText, feature.sortOrder],
      connection,
    );
  }

  for (const specification of payload.specifications) {
    await execute(
      `
        INSERT INTO product_specs (product_id, spec_key, spec_value, sort_order)
        VALUES (?, ?, ?, ?)
      `,
      [productId, specification.specKey, specification.specValue, specification.sortOrder],
      connection,
    );
  }
};

const listProducts = async (filters = {}, options = {}) => {
  const { page, pageSize, offset } = parsePagination(filters, { pageSize: 12, maxPageSize: 50 });
  const { where, params } = buildProductFilters(filters, options);
  const sortClause = buildSortClause(filters.sort);

  const [totalRow, rows] = await Promise.all([
    one(
      `
        SELECT COUNT(*) AS total
        FROM products p
        INNER JOIN categories c ON c.id = p.category_id
        ${where}
      `,
      params,
    ),
    query(
      `
        ${productSelect}
        ${where}
        ${sortClause}
        LIMIT ? OFFSET ?
      `,
      [...params, pageSize, offset],
    ),
  ]);

  return {
    items: rows.map(mapProduct),
    meta: buildPaginationMeta(Number(totalRow?.total || 0), page, pageSize),
  };
};

const getProductById = async (identifier, { includeInactive = false } = {}) => {
  const isNumeric = /^\d+$/.test(String(identifier));
  const field = isNumeric ? 'p.id' : 'p.slug';
  const value = isNumeric ? Number(identifier) : String(identifier);
  const row = await one(
    `
      ${productSelect}
      WHERE ${field} = ? ${includeInactive ? '' : 'AND p.is_active = TRUE'}
      LIMIT 1
    `,
    [value],
  );

  if (!row) {
    throw new ApiError(404, 'Product not found');
  }

  return mapProduct(row);
};

const createProduct = async (payload) =>
  withTransaction(async (connection) => {
    try {
      const result = await execute(
        `
          INSERT INTO products (
            category_id,
            name,
            slug,
            sku,
            brand,
            short_description,
            description,
            price,
            compare_at_price,
            stock_quantity,
            low_stock_threshold,
            warranty,
            search_keywords,
            is_featured,
            is_active
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          payload.categoryId,
          payload.name,
          payload.slug,
          payload.sku,
          payload.brand,
          payload.shortDescription || null,
          payload.description,
          payload.price,
          payload.compareAtPrice,
          payload.stockQuantity,
          payload.lowStockThreshold,
          payload.warranty || null,
          payload.searchKeywords || null,
          payload.isFeatured,
          payload.isActive,
        ],
        connection,
      );

      await syncProductRelations(connection, result.insertId, payload);
      await execute(
        `
          INSERT INTO inventory_movements (product_id, quantity_delta, change_type, reference_type, reference_id, notes)
          VALUES (?, ?, 'admin_adjustment', 'product', ?, 'Initial stock set during product creation')
        `,
        [result.insertId, payload.stockQuantity, String(result.insertId)],
        connection,
      );

      return getProductById(result.insertId, { includeInactive: true });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ApiError(409, 'Product slug or SKU already exists');
      }

      throw error;
    }
  });

const updateProduct = async (productId, payload) =>
  withTransaction(async (connection) => {
    const existing = await one(
      'SELECT id, stock_quantity FROM products WHERE id = ? LIMIT 1',
      [productId],
      connection,
    );

    if (!existing) {
      throw new ApiError(404, 'Product not found');
    }

    try {
      await execute(
        `
          UPDATE products
          SET
            category_id = ?,
            name = ?,
            slug = ?,
            sku = ?,
            brand = ?,
            short_description = ?,
            description = ?,
            price = ?,
            compare_at_price = ?,
            stock_quantity = ?,
            low_stock_threshold = ?,
            warranty = ?,
            search_keywords = ?,
            is_featured = ?,
            is_active = ?
          WHERE id = ?
        `,
        [
          payload.categoryId,
          payload.name,
          payload.slug,
          payload.sku,
          payload.brand,
          payload.shortDescription || null,
          payload.description,
          payload.price,
          payload.compareAtPrice,
          payload.stockQuantity,
          payload.lowStockThreshold,
          payload.warranty || null,
          payload.searchKeywords || null,
          payload.isFeatured,
          payload.isActive,
          productId,
        ],
        connection,
      );

      await syncProductRelations(connection, productId, payload);

      const delta = payload.stockQuantity - Number(existing.stock_quantity || 0);

      if (delta !== 0) {
        await execute(
          `
            INSERT INTO inventory_movements (product_id, quantity_delta, change_type, reference_type, reference_id, notes)
            VALUES (?, ?, 'admin_adjustment', 'product', ?, 'Stock updated from admin product editor')
          `,
          [productId, delta, String(productId)],
          connection,
        );
      }

      return getProductById(productId, { includeInactive: true });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ApiError(409, 'Product slug or SKU already exists');
      }

      throw error;
    }
  });

const deleteProduct = async (productId) => {
  const product = await getProductById(productId, { includeInactive: true });
  await execute('UPDATE products SET is_active = FALSE WHERE id = ?', [productId]);
  return product;
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
