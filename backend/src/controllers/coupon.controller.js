const asyncHandler = require('../utils/async-handler');
const couponService = require('../services/coupon.service');
const { validateCouponPayload } = require('../validators/coupon.validator');
const { requiredInteger, requiredNumber, requiredString } = require('../utils/validation');

exports.listCoupons = asyncHandler(async (req, res) => {
  const coupons = await couponService.listCoupons();
  res.json({ success: true, data: coupons });
});

exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.createCoupon(validateCouponPayload(req.body));
  res.status(201).json({ success: true, data: coupon, message: 'Coupon created successfully' });
});

exports.updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.updateCoupon(
    requiredInteger(req.params.id, 'Coupon', { min: 1 }),
    validateCouponPayload(req.body),
  );
  res.json({ success: true, data: coupon, message: 'Coupon updated successfully' });
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  await couponService.deleteCoupon(requiredInteger(req.params.id, 'Coupon', { min: 1 }));
  res.json({ success: true, message: 'Coupon archived successfully' });
});

exports.validateCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.validateCouponForAmount(
    requiredString(req.query.code, 'Coupon code', { min: 3, max: 40 }).toUpperCase(),
    requiredNumber(req.query.subtotal, 'Subtotal', { min: 0 }),
  );
  res.json({ success: true, data: coupon });
});
