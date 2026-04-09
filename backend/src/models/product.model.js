const safeJson = (value, fallback = []) => {
  if (!value) {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const mapProduct = (row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  sku: row.sku,
  brand: row.brand,
  shortDescription: row.short_description || '',
  description: row.description,
  price: Number(row.price || 0),
  compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : null,
  currency: row.currency || 'USD',
  stockQuantity: Number(row.stock_quantity || 0),
  lowStockThreshold: Number(row.low_stock_threshold || 0),
  ratingAverage: Number(row.rating_average || 0),
  ratingCount: Number(row.rating_count || 0),
  soldCount: Number(row.sold_count || 0),
  warranty: row.warranty || '',
  isFeatured: Boolean(row.is_featured),
  isActive: Boolean(row.is_active),
  category: row.category_id
    ? {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
        icon: row.category_icon || '',
      }
    : null,
  images: safeJson(row.images_json),
  features: safeJson(row.features_json),
  specifications: safeJson(row.specifications_json),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

module.exports = {
  mapProduct,
};
