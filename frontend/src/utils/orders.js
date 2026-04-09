export const getOrderDisplayNumber = (order) =>
  order?.orderNumber || String(order?.id || '').padStart(6, '0');

export const getOrderStatus = (order) =>
  order?.orderStatus || order?.status || 'pending';

export const getOrderSubtotal = (order) =>
  order?.subtotal ?? order?.itemsTotal ?? order?.itemsPrice ?? 0;

export const getOrderShipping = (order) =>
  order?.shippingAmount ?? order?.shippingCost ?? order?.shippingPrice ?? 0;

export const getOrderTax = (order) =>
  order?.taxAmount ?? order?.tax ?? order?.taxPrice ?? 0;

export const getOrderTotal = (order) =>
  order?.totalAmount ?? order?.totalPrice ?? 0;

export const getOrderPlacedAt = (order) =>
  order?.placedAt || order?.createdAt || '';
