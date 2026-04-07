export const getOrderDisplayNumber = (order) =>
  order?.orderNumber || String(order?._id || '').slice(-6).toUpperCase() || '------';

export const getOrderStatus = (order) =>
  order?.orderStatus || order?.status || 'pending';

export const getOrderSubtotal = (order) =>
  order?.itemsTotal ?? order?.itemsPrice ?? 0;

export const getOrderShipping = (order) =>
  order?.shippingCost ?? order?.shippingPrice ?? 0;

export const getOrderTax = (order) =>
  order?.tax ?? order?.taxPrice ?? 0;

export const getOrderTotal = (order) =>
  order?.totalAmount ?? order?.totalPrice ?? 0;
