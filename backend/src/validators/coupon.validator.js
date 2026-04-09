const {
  optionalBoolean,
  optionalNumber,
  optionalString,
  requiredNumber,
  requiredString,
} = require('../utils/validation');

const validateCouponPayload = (payload = {}) => ({
  code: requiredString(payload.code, 'Coupon code', { min: 3, max: 40 }).toUpperCase(),
  description: optionalString(payload.description, { max: 255 }),
  discountType: payload.discountType === 'fixed' ? 'fixed' : 'percent',
  discountValue: requiredNumber(payload.discountValue, 'Discount value', { min: 0 }),
  minOrderValue: optionalNumber(payload.minOrderValue, { min: 0, fallback: 0 }),
  maxDiscountAmount: optionalNumber(payload.maxDiscountAmount, { min: 0 }),
  startsAt: payload.startsAt || null,
  endsAt: payload.endsAt || null,
  usageLimit: payload.usageLimit ? Number(payload.usageLimit) : null,
  isActive: optionalBoolean(payload.isActive, true),
});

module.exports = {
  validateCouponPayload,
};
