const asyncHandler = require('../utils/async-handler');
const orderService = require('../services/order.service');
const { validateCheckoutPayload, validateOrderStatusPayload } = require('../validators/order.validator');
const { requiredInteger } = require('../utils/validation');

exports.checkout = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user.id, validateCheckoutPayload(req.body));
  res.status(201).json({ success: true, data: order, message: 'Order placed successfully' });
});

exports.listMyOrders = asyncHandler(async (req, res) => {
  const result = await orderService.listMyOrders(req.user.id, req.query);
  res.json({ success: true, data: result.items, meta: result.meta });
});

exports.listOrders = asyncHandler(async (req, res) => {
  const result = await orderService.listOrders(req.query);
  res.json({ success: true, data: result.items, meta: result.meta });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(
    requiredInteger(req.params.id, 'Order', { min: 1 }),
    { requesterId: req.user.id, isAdmin: req.user.role === 'admin' },
  );
  res.json({ success: true, data: order });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(
    requiredInteger(req.params.id, 'Order', { min: 1 }),
    validateOrderStatusPayload(req.body),
  );
  res.json({ success: true, data: order, message: 'Order status updated successfully' });
});
