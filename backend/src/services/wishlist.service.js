const { execute, one, query } = require('../config/database');
const ApiError = require('../utils/api-error');

const ensureWishlist = async (userId, connection) => {
  const wishlist = await one('SELECT id FROM wishlists WHERE user_id = ? LIMIT 1', [userId], connection);

  if (wishlist) {
    return wishlist.id;
  }

  const result = await execute('INSERT INTO wishlists (user_id) VALUES (?)', [userId], connection);
  return result.insertId;
};

const listWishlist = async (userId) => {
  const wishlistId = await ensureWishlist(userId);
  const rows = await query(
    `
      SELECT
        wi.id,
        p.id AS product_id,
        p.name,
        p.slug,
        p.brand,
        p.price,
        p.compare_at_price,
        p.rating_average,
        p.rating_count,
        p.stock_quantity,
        (
          SELECT pi.image_url
          FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY pi.sort_order ASC
          LIMIT 1
        ) AS image_url
      FROM wishlist_items wi
      INNER JOIN products p ON p.id = wi.product_id
      WHERE wi.wishlist_id = ?
      ORDER BY wi.created_at DESC
    `,
    [wishlistId],
  );

  return rows.map((row) => ({
    id: row.id,
    productId: row.product_id,
    name: row.name,
    slug: row.slug,
    brand: row.brand,
    price: Number(row.price || 0),
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : null,
    ratingAverage: Number(row.rating_average || 0),
    ratingCount: Number(row.rating_count || 0),
    stockQuantity: Number(row.stock_quantity || 0),
    imageUrl: row.image_url || '',
  }));
};

const toggleWishlist = async (userId, productId) => {
  const product = await one(
    'SELECT id, is_active FROM products WHERE id = ? LIMIT 1',
    [productId],
  );

  if (!product || !product.is_active) {
    throw new ApiError(404, 'Product not found');
  }

  const wishlistId = await ensureWishlist(userId);
  const item = await one(
    'SELECT id FROM wishlist_items WHERE wishlist_id = ? AND product_id = ? LIMIT 1',
    [wishlistId, productId],
  );

  if (item) {
    await execute('DELETE FROM wishlist_items WHERE id = ?', [item.id]);
    return { action: 'removed', items: await listWishlist(userId) };
  }

  await execute(
    'INSERT INTO wishlist_items (wishlist_id, product_id) VALUES (?, ?)',
    [wishlistId, productId],
  );

  return { action: 'added', items: await listWishlist(userId) };
};

module.exports = {
  listWishlist,
  toggleWishlist,
};
