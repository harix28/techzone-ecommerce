const { execute, one, query } = require('../config/database');
const ApiError = require('../utils/api-error');

const cartItemSelect = `
  SELECT
    ci.id,
    ci.product_id,
    ci.quantity,
    ci.unit_price_snapshot,
    p.name,
    p.slug,
    p.brand,
    p.price,
    p.stock_quantity,
    p.is_active,
    (
      SELECT pi.image_url
      FROM product_images pi
      WHERE pi.product_id = p.id
      ORDER BY pi.sort_order ASC
      LIMIT 1
    ) AS image_url
  FROM carts c
  LEFT JOIN cart_items ci ON ci.cart_id = c.id
  LEFT JOIN products p ON p.id = ci.product_id
  WHERE c.user_id = ?
`;

const ensureCart = async (userId, connection) => {
  const cart = await one('SELECT id FROM carts WHERE user_id = ? LIMIT 1', [userId], connection);

  if (cart) {
    return cart.id;
  }

  const result = await execute('INSERT INTO carts (user_id) VALUES (?)', [userId], connection);
  return result.insertId;
};

const normalizeCart = (rows) => {
  const items = rows
    .filter((row) => row.product_id)
    .map((row) => ({
      id: row.id,
      productId: row.product_id,
      name: row.name,
      slug: row.slug,
      brand: row.brand,
      price: Number(row.price || row.unit_price_snapshot || 0),
      quantity: Number(row.quantity || 0),
      stockQuantity: Number(row.stock_quantity || 0),
      imageUrl: row.image_url || '',
      lineTotal: Number((Number(row.price || row.unit_price_snapshot || 0) * Number(row.quantity || 0)).toFixed(2)),
      isActive: Boolean(row.is_active),
    }));
  const subtotal = Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    subtotal,
    itemCount,
  };
};

const getCart = async (userId) => {
  await ensureCart(userId);
  const rows = await query(cartItemSelect, [userId]);
  return normalizeCart(rows);
};

const saveCartItem = async (userId, productId, quantity, { mode = 'set' } = {}) => {
  const product = await one(
    `
      SELECT id, price, stock_quantity, is_active
      FROM products
      WHERE id = ?
      LIMIT 1
    `,
    [productId],
  );

  if (!product || !product.is_active) {
    throw new ApiError(404, 'Product not found');
  }

  const cartId = await ensureCart(userId);
  const existing = await one(
    'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1',
    [cartId, productId],
  );

  const nextQuantity =
    mode === 'increment'
      ? Number(existing?.quantity || 0) + Number(quantity)
      : Number(quantity);

  if (nextQuantity <= 0) {
    if (existing) {
      await execute('DELETE FROM cart_items WHERE id = ?', [existing.id]);
    }

    return getCart(userId);
  }

  if (nextQuantity > Number(product.stock_quantity || 0)) {
    throw new ApiError(400, `Only ${product.stock_quantity} units are available`);
  }

  if (existing) {
    await execute(
      `
        UPDATE cart_items
        SET quantity = ?, unit_price_snapshot = ?
        WHERE id = ?
      `,
      [nextQuantity, product.price, existing.id],
    );
  } else {
    await execute(
      `
        INSERT INTO cart_items (cart_id, product_id, quantity, unit_price_snapshot)
        VALUES (?, ?, ?, ?)
      `,
      [cartId, productId, nextQuantity, product.price],
    );
  }

  return getCart(userId);
};

const clearCart = async (userId) => {
  const cartId = await ensureCart(userId);
  await execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
  return getCart(userId);
};

module.exports = {
  getCart,
  saveCartItem,
  clearCart,
};
