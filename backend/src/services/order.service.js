const crypto = require('crypto');

const { execute, one, query, withTransaction } = require('../config/database');
const { mapOrder, mapOrderItem } = require('../models/order.model');
const { buildPaginationMeta, parsePagination } = require('../utils/pagination');
const ApiError = require('../utils/api-error');
const { validateCouponForAmount } = require('./coupon.service');

const getOrderRows = async (whereClause, params, { pageSize = null, offset = 0, connection = null } = {}) => {
  const runnerQuery = connection ? (sql, values) => query(sql, values, connection) : query;
  const limitClause = pageSize ? 'LIMIT ? OFFSET ?' : '';
  const rows = await runnerQuery(
    `
      SELECT
        o.*,
        u.id AS user_id,
        u.full_name,
        u.email
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
      ${whereClause}
      ORDER BY o.created_at DESC
      ${limitClause}
    `,
    pageSize ? [...params, pageSize, offset] : params,
  );

  if (rows.length === 0) {
    return [];
  }

  const orderIds = rows.map((row) => row.id);
  const itemRows = await runnerQuery(
    `
      SELECT *
      FROM order_items
      WHERE order_id IN (${orderIds.map(() => '?').join(', ')})
      ORDER BY created_at ASC
    `,
    orderIds,
  );

  return rows.map((row) => {
    const items = itemRows.filter((item) => item.order_id === row.id).map(mapOrderItem);
    return mapOrder(row, items);
  });
};

const getAddressSnapshot = async (userId, addressId, connection) => {
  const address = await one(
    `
      SELECT *
      FROM addresses
      WHERE id = ? AND user_id = ?
      LIMIT 1
    `,
    [addressId, userId],
    connection,
  );

  if (!address) {
    throw new ApiError(404, 'Shipping address not found');
  }

  return address;
};

const getCartCheckoutItems = async (userId, connection) => {
  const rows = await query(
    `
      SELECT
        ci.id,
        ci.quantity,
        p.id AS product_id,
        p.name,
        p.slug,
        p.sku,
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
      INNER JOIN cart_items ci ON ci.cart_id = c.id
      INNER JOIN products p ON p.id = ci.product_id
      WHERE c.user_id = ?
      ORDER BY ci.created_at ASC
    `,
    [userId],
    connection,
  );

  if (rows.length === 0) {
    throw new ApiError(400, 'Your cart is empty');
  }

  return rows;
};

const generateOrderNumber = () => `TZ-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

const createOrder = async (userId, payload) =>
  withTransaction(async (connection) => {
    const cartItems = await getCartCheckoutItems(userId, connection);
    const address = await getAddressSnapshot(userId, payload.addressId, connection);
    const productIds = cartItems.map((item) => item.product_id);
    const lockedProducts = await query(
      `
        SELECT id, stock_quantity, is_active
        FROM products
        WHERE id IN (${productIds.map(() => '?').join(', ')})
        FOR UPDATE
      `,
      productIds,
      connection,
    );
    const lockedProductMap = new Map(lockedProducts.map((row) => [row.id, row]));

    for (const item of cartItems) {
      const lockedProduct = lockedProductMap.get(item.product_id);

      if (!lockedProduct || !lockedProduct.is_active) {
        throw new ApiError(400, `${item.name} is no longer available`);
      }

      if (Number(item.quantity) > Number(lockedProduct.stock_quantity || 0)) {
        throw new ApiError(400, `${item.name} only has ${lockedProduct.stock_quantity} units in stock`);
      }
    }

    const subtotal = Number(
      cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0).toFixed(2),
    );
    const shippingAmount = subtotal >= 99 ? 0 : 9.99;
    const taxAmount = Number((subtotal * 0.08).toFixed(2));
    const coupon = await validateCouponForAmount(payload.couponCode, subtotal, connection);
    const discountAmount = Number(coupon?.discountAmount || 0);
    const totalAmount = Number((subtotal + shippingAmount + taxAmount - discountAmount).toFixed(2));

    const orderNumber = generateOrderNumber();
    const orderResult = await execute(
      `
        INSERT INTO orders (
          order_number,
          user_id,
          address_id,
          address_label,
          address_full_name,
          address_phone,
          address_line1,
          address_line2,
          address_city,
          address_state,
          address_postal_code,
          address_country,
          status,
          payment_status,
          payment_method,
          coupon_id,
          coupon_code,
          discount_amount,
          subtotal,
          shipping_amount,
          tax_amount,
          total_amount,
          notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        orderNumber,
        userId,
        address.id,
        address.label,
        address.full_name,
        address.phone,
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.postal_code,
        address.country,
        payload.paymentMethod,
        coupon?.id || null,
        coupon?.code || null,
        discountAmount,
        subtotal,
        shippingAmount,
        taxAmount,
        totalAmount,
        payload.notes || null,
      ],
      connection,
    );

    for (const item of cartItems) {
      const lineTotal = Number((Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2));

      await execute(
        `
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            sku,
            image_url,
            unit_price,
            quantity,
            line_total
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          orderResult.insertId,
          item.product_id,
          item.name,
          item.sku,
          item.image_url || null,
          item.price,
          item.quantity,
          lineTotal,
        ],
        connection,
      );

      await execute(
        `
          UPDATE products
          SET stock_quantity = stock_quantity - ?, sold_count = sold_count + ?
          WHERE id = ?
        `,
        [item.quantity, item.quantity, item.product_id],
        connection,
      );

      await execute(
        `
          INSERT INTO inventory_movements (product_id, quantity_delta, change_type, reference_type, reference_id, notes)
          VALUES (?, ?, 'order_placed', 'order', ?, ?)
        `,
        [item.product_id, -Number(item.quantity), String(orderResult.insertId), `Reserved for order ${orderNumber}`],
        connection,
      );
    }

    await execute(
      `
        INSERT INTO payments (order_id, provider, transaction_reference, amount, currency, status)
        VALUES (?, ?, ?, ?, 'USD', 'pending')
      `,
      [orderResult.insertId, payload.paymentMethod, `${orderNumber}-${payload.paymentMethod}`, totalAmount],
      connection,
    );

    if (coupon?.id) {
      await execute('UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ?', [coupon.id], connection);
    }

    await execute(
      `
        DELETE ci
        FROM cart_items ci
        INNER JOIN carts c ON c.id = ci.cart_id
        WHERE c.user_id = ?
      `,
      [userId],
      connection,
    );

    return getOrderById(orderResult.insertId, { requesterId: userId, isAdmin: false }, connection);
  });

const getOrderById = async (orderId, { requesterId, isAdmin }, connection = null) => {
  const rows = await getOrderRows('WHERE o.id = ?', [orderId], { connection });
  const order = rows[0];

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (!isAdmin && order.customer?.id !== requesterId) {
    throw new ApiError(403, 'You do not have access to this order');
  }

  return order;
};

const listMyOrders = async (userId, queryParams = {}) => {
  const { page, pageSize, offset } = parsePagination(queryParams, { pageSize: 10, maxPageSize: 50 });
  const totalRow = await one('SELECT COUNT(*) AS total FROM orders WHERE user_id = ?', [userId]);
  const items = await getOrderRows('WHERE o.user_id = ?', [userId], { pageSize, offset });

  return {
    items,
    meta: buildPaginationMeta(Number(totalRow?.total || 0), page, pageSize),
  };
};

const listOrders = async (queryParams = {}) => {
  const { page, pageSize, offset } = parsePagination(queryParams, { pageSize: 20, maxPageSize: 50 });
  const search = String(queryParams.search || '').trim();
  const conditions = [];
  const params = [];

  if (queryParams.status) {
    conditions.push('o.status = ?');
    params.push(queryParams.status);
  }

  if (search) {
    conditions.push('(o.order_number LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const totalRow = await one(
    `
      SELECT COUNT(*) AS total
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
      ${whereClause}
    `,
    params,
  );
  const items = await getOrderRows(whereClause, params, { pageSize, offset });

  return {
    items,
    meta: buildPaginationMeta(Number(totalRow?.total || 0), page, pageSize),
  };
};

const updateOrderStatus = async (orderId, payload) =>
  withTransaction(async (connection) => {
    const order = await one('SELECT * FROM orders WHERE id = ? LIMIT 1', [orderId], connection);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (order.status === 'cancelled' && payload.status !== 'cancelled') {
      throw new ApiError(400, 'Cancelled orders cannot be reopened');
    }

    if (payload.status === 'cancelled' && order.status !== 'cancelled') {
      const items = await query('SELECT * FROM order_items WHERE order_id = ?', [orderId], connection);

      for (const item of items) {
        if (item.product_id) {
          await execute(
            'UPDATE products SET stock_quantity = stock_quantity + ?, sold_count = GREATEST(sold_count - ?, 0) WHERE id = ?',
            [item.quantity, item.quantity, item.product_id],
            connection,
          );
          await execute(
            `
              INSERT INTO inventory_movements (product_id, quantity_delta, change_type, reference_type, reference_id, notes)
              VALUES (?, ?, 'order_cancelled', 'order', ?, ?)
            `,
            [item.product_id, item.quantity, String(orderId), `Restored stock for cancelled order ${order.order_number}`],
            connection,
          );
        }
      }
    }

    await execute(
      `
        UPDATE orders
        SET
          status = ?,
          tracking_number = ?,
          delivered_at = ?,
          cancelled_at = ?
        WHERE id = ?
      `,
      [
        payload.status,
        payload.trackingNumber || null,
        payload.status === 'delivered' ? new Date() : null,
        payload.status === 'cancelled' ? new Date() : null,
        orderId,
      ],
      connection,
    );

    if (payload.status === 'delivered' && order.payment_method === 'cod') {
      await execute(
        `
          UPDATE orders
          SET payment_status = 'paid'
          WHERE id = ?
        `,
        [orderId],
        connection,
      );
      await execute(
        `
          UPDATE payments
          SET status = 'paid', paid_at = CURRENT_TIMESTAMP
          WHERE order_id = ?
        `,
        [orderId],
        connection,
      );
    }

    return getOrderById(orderId, { requesterId: order.user_id, isAdmin: true }, connection);
  });

module.exports = {
  createOrder,
  getOrderById,
  listMyOrders,
  listOrders,
  updateOrderStatus,
};
