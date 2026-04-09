const { execute, one, query } = require('../config/database');
const ApiError = require('../utils/api-error');

const mapCoupon = (row) => ({
  id: row.id,
  code: row.code,
  description: row.description || '',
  discountType: row.discount_type,
  discountValue: Number(row.discount_value || 0),
  minOrderValue: Number(row.min_order_value || 0),
  maxDiscountAmount: row.max_discount_amount ? Number(row.max_discount_amount) : null,
  startsAt: row.starts_at,
  endsAt: row.ends_at,
  usageLimit: row.usage_limit,
  usageCount: row.usage_count,
  isActive: Boolean(row.is_active),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const listCoupons = async () => {
  const rows = await query('SELECT * FROM coupons ORDER BY created_at DESC');
  return rows.map(mapCoupon);
};

const createCoupon = async (payload) => {
  try {
    const result = await execute(
      `
        INSERT INTO coupons (
          code,
          description,
          discount_type,
          discount_value,
          min_order_value,
          max_discount_amount,
          starts_at,
          ends_at,
          usage_limit,
          is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.code,
        payload.description || null,
        payload.discountType,
        payload.discountValue,
        payload.minOrderValue,
        payload.maxDiscountAmount,
        payload.startsAt,
        payload.endsAt,
        payload.usageLimit,
        payload.isActive,
      ],
    );

    return getCouponById(result.insertId);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new ApiError(409, 'Coupon code already exists');
    }

    throw error;
  }
};

const updateCoupon = async (id, payload) => {
  const coupon = await getCouponById(id);

  try {
    await execute(
      `
        UPDATE coupons
        SET
          code = ?,
          description = ?,
          discount_type = ?,
          discount_value = ?,
          min_order_value = ?,
          max_discount_amount = ?,
          starts_at = ?,
          ends_at = ?,
          usage_limit = ?,
          is_active = ?
        WHERE id = ?
      `,
      [
        payload.code,
        payload.description || null,
        payload.discountType,
        payload.discountValue,
        payload.minOrderValue,
        payload.maxDiscountAmount,
        payload.startsAt,
        payload.endsAt,
        payload.usageLimit,
        payload.isActive,
        id,
      ],
    );

    return getCouponById(id);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new ApiError(409, 'Coupon code already exists');
    }

    throw error;
  }
};

const getCouponById = async (id) => {
  const row = await one('SELECT * FROM coupons WHERE id = ? LIMIT 1', [id]);

  if (!row) {
    throw new ApiError(404, 'Coupon not found');
  }

  return mapCoupon(row);
};

const deleteCoupon = async (id) => {
  const coupon = await getCouponById(id);
  await execute('UPDATE coupons SET is_active = FALSE WHERE id = ?', [id]);
  return coupon;
};

const validateCouponForAmount = async (code, subtotal, connection) => {
  if (!code) {
    return null;
  }

  const row = await one(
    `
      SELECT *
      FROM coupons
      WHERE code = ?
      LIMIT 1
    `,
    [String(code).toUpperCase()],
    connection,
  );

  if (!row) {
    throw new ApiError(404, 'Coupon code was not found');
  }

  const coupon = mapCoupon(row);
  const now = new Date();

  if (!coupon.isActive) {
    throw new ApiError(400, 'Coupon is inactive');
  }

  if (coupon.startsAt && new Date(coupon.startsAt) > now) {
    throw new ApiError(400, 'Coupon is not active yet');
  }

  if (coupon.endsAt && new Date(coupon.endsAt) < now) {
    throw new ApiError(400, 'Coupon has expired');
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw new ApiError(400, 'Coupon usage limit has been reached');
  }

  if (subtotal < coupon.minOrderValue) {
    throw new ApiError(400, `Coupon requires a minimum subtotal of $${coupon.minOrderValue.toFixed(2)}`);
  }

  const rawDiscount =
    coupon.discountType === 'percent'
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;
  const discountAmount = coupon.maxDiscountAmount
    ? Math.min(rawDiscount, coupon.maxDiscountAmount)
    : rawDiscount;

  return {
    ...coupon,
    discountAmount: Number(discountAmount.toFixed(2)),
  };
};

module.exports = {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCouponForAmount,
};
