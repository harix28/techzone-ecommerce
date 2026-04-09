const { optionalString, oneOf, requiredInteger } = require('../utils/validation');

const PAYMENT_METHODS = ['cod', 'card', 'upi', 'paypal'];
const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const validateCheckoutPayload = (payload = {}) => ({
  addressId: requiredInteger(payload.addressId, 'Address', { min: 1 }),
  paymentMethod: oneOf(payload.paymentMethod || 'cod', PAYMENT_METHODS, 'Payment method'),
  couponCode: optionalString(payload.couponCode, { max: 40 }),
  notes: optionalString(payload.notes, { max: 500 }),
});

const validateOrderStatusPayload = (payload = {}) => ({
  status: oneOf(payload.status, ORDER_STATUSES, 'Order status'),
  trackingNumber: optionalString(payload.trackingNumber, { max: 100 }),
});

module.exports = {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  validateCheckoutPayload,
  validateOrderStatusPayload,
};
