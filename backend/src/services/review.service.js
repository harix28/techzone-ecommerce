const { execute, one, query } = require('../config/database');
const ApiError = require('../utils/api-error');

const mapReview = (row) => ({
  id: row.id,
  rating: Number(row.rating || 0),
  title: row.title || '',
  comment: row.comment,
  isVerifiedPurchase: Boolean(row.is_verified_purchase),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  user: {
    id: row.user_id,
    name: row.full_name,
    avatar: row.avatar_url || '',
  },
});

const refreshProductRatings = async (productId, connection) => {
  const ratingRow = await one(
    `
      SELECT
        COALESCE(AVG(rating), 0) AS average_rating,
        COUNT(*) AS rating_count
      FROM reviews
      WHERE product_id = ?
    `,
    [productId],
    connection,
  );

  await execute(
    `
      UPDATE products
      SET rating_average = ?, rating_count = ?
      WHERE id = ?
    `,
    [Number(ratingRow?.average_rating || 0), Number(ratingRow?.rating_count || 0), productId],
    connection,
  );
};

const listProductReviews = async (productId) => {
  const rows = await query(
    `
      SELECT
        r.*,
        u.full_name,
        u.avatar_url
      FROM reviews r
      INNER JOIN users u ON u.id = r.user_id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `,
    [productId],
  );

  return rows.map(mapReview);
};

const createReview = async (userId, productId, payload) => {
  const product = await one('SELECT id, is_active FROM products WHERE id = ? LIMIT 1', [productId]);

  if (!product || !product.is_active) {
    throw new ApiError(404, 'Product not found');
  }

  const existingReview = await one(
    'SELECT id FROM reviews WHERE product_id = ? AND user_id = ? LIMIT 1',
    [productId, userId],
  );

  if (existingReview) {
    throw new ApiError(409, 'You have already reviewed this product');
  }

  const purchase = await one(
    `
      SELECT oi.id
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi.order_id
      WHERE oi.product_id = ? AND o.user_id = ? AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
      LIMIT 1
    `,
    [productId, userId],
  );

  const result = await execute(
    `
      INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [productId, userId, payload.rating, payload.title || null, payload.comment, Boolean(purchase)],
  );

  await refreshProductRatings(productId);

  const created = await one(
    `
      SELECT
        r.*,
        u.full_name,
        u.avatar_url
      FROM reviews r
      INNER JOIN users u ON u.id = r.user_id
      WHERE r.id = ?
      LIMIT 1
    `,
    [result.insertId],
  );

  return mapReview(created);
};

module.exports = {
  listProductReviews,
  createReview,
};
