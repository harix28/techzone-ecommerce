const asyncHandler = require('../utils/async-handler');
const cartService = require('../services/cart.service');
const { requiredInteger } = require('../utils/validation');

exports.getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  res.json({ success: true, data: cart });
});

exports.addItem = asyncHandler(async (req, res) => {
  const productId = requiredInteger(req.body.productId, 'Product', { min: 1 });
  const quantity = requiredInteger(req.body.quantity || 1, 'Quantity', { min: 1, max: 999 });
  const cart = await cartService.saveCartItem(req.user.id, productId, quantity, { mode: 'increment' });
  res.json({ success: true, data: cart, message: 'Cart updated successfully' });
});

exports.updateItem = asyncHandler(async (req, res) => {
  const productId = requiredInteger(req.params.productId, 'Product', { min: 1 });
  const quantity = requiredInteger(req.body.quantity, 'Quantity', { min: 0, max: 999 });
  const cart = await cartService.saveCartItem(req.user.id, productId, quantity, { mode: 'set' });
  res.json({ success: true, data: cart, message: 'Cart updated successfully' });
});

exports.removeItem = asyncHandler(async (req, res) => {
  const productId = requiredInteger(req.params.productId, 'Product', { min: 1 });
  const cart = await cartService.saveCartItem(req.user.id, productId, 0, { mode: 'set' });
  res.json({ success: true, data: cart, message: 'Item removed from cart' });
});

exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user.id);
  res.json({ success: true, data: cart, message: 'Cart cleared successfully' });
});
