const mapOrderItem = (row) => ({
  id: row.id,
  productId: row.product_id,
  productName: row.product_name,
  sku: row.sku,
  imageUrl: row.image_url || '',
  unitPrice: Number(row.unit_price || 0),
  quantity: Number(row.quantity || 0),
  lineTotal: Number(row.line_total || 0),
});

const mapOrder = (row, items = []) => ({
  id: row.id,
  orderNumber: row.order_number,
  status: row.status,
  paymentStatus: row.payment_status,
  paymentMethod: row.payment_method,
  couponCode: row.coupon_code || '',
  discountAmount: Number(row.discount_amount || 0),
  subtotal: Number(row.subtotal || 0),
  shippingAmount: Number(row.shipping_amount || 0),
  taxAmount: Number(row.tax_amount || 0),
  totalAmount: Number(row.total_amount || 0),
  trackingNumber: row.tracking_number || '',
  notes: row.notes || '',
  placedAt: row.placed_at,
  deliveredAt: row.delivered_at,
  cancelledAt: row.cancelled_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  customer: row.user_id
    ? {
        id: row.user_id,
        name: row.full_name,
        email: row.email,
      }
    : null,
  shippingAddress: row.address_id
    ? {
        id: row.address_id,
        label: row.address_label,
        fullName: row.address_full_name,
        phone: row.address_phone,
        line1: row.address_line1,
        line2: row.address_line2 || '',
        city: row.address_city,
        state: row.address_state,
        postalCode: row.address_postal_code,
        country: row.address_country,
      }
    : null,
  items,
});

module.exports = {
  mapOrder,
  mapOrderItem,
};
