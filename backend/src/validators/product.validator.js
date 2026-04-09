const slugify = require('../utils/slugify');
const {
  optionalArray,
  optionalBoolean,
  optionalInteger,
  optionalNumber,
  optionalString,
  requiredInteger,
  requiredNumber,
  requiredString,
} = require('../utils/validation');

const validateProductPayload = (payload = {}) => {
  const name = requiredString(payload.name, 'Product name', { min: 2, max: 190 });
  const images = optionalArray(payload.images).map((image, index) => ({
    imageUrl: requiredString(image?.imageUrl || image, `Image ${index + 1}`, { max: 500 }),
    altText: optionalString(image?.altText || name, { max: 190, fallback: name }),
    sortOrder: optionalInteger(image?.sortOrder, { min: 0, max: 99, fallback: index }),
  }));
  const features = optionalArray(payload.features).map((feature, index) => ({
    featureText: requiredString(feature?.featureText || feature, `Feature ${index + 1}`, { max: 255 }),
    sortOrder: optionalInteger(feature?.sortOrder, { min: 0, max: 99, fallback: index }),
  }));
  const specifications = optionalArray(payload.specifications).map((specification, index) => ({
    specKey: requiredString(specification?.key || specification?.specKey, `Specification key ${index + 1}`, { max: 120 }),
    specValue: requiredString(specification?.value || specification?.specValue, `Specification value ${index + 1}`, { max: 255 }),
    sortOrder: optionalInteger(specification?.sortOrder, { min: 0, max: 99, fallback: index }),
  }));

  return {
    name,
    slug: optionalString(payload.slug, { max: 220, fallback: slugify(name) }),
    sku: requiredString(payload.sku, 'SKU', { min: 3, max: 80 }).toUpperCase(),
    brand: requiredString(payload.brand, 'Brand', { min: 2, max: 120 }),
    shortDescription: optionalString(payload.shortDescription, { max: 255 }),
    description: requiredString(payload.description, 'Description', { min: 20, max: 6000 }),
    categoryId: requiredInteger(payload.categoryId ?? payload.category, 'Category', { min: 1 }),
    price: requiredNumber(payload.price, 'Price', { min: 0 }),
    compareAtPrice: optionalNumber(payload.compareAtPrice ?? payload.originalPrice, { min: 0 }),
    stockQuantity: requiredInteger(payload.stockQuantity ?? payload.stock, 'Stock quantity', { min: 0 }),
    lowStockThreshold: optionalInteger(payload.lowStockThreshold, { min: 0, max: 9999, fallback: 5 }),
    warranty: optionalString(payload.warranty, { max: 120 }),
    searchKeywords: optionalString(
      Array.isArray(payload.tags)
        ? payload.tags.join(', ')
        : payload.searchKeywords || payload.tags,
      { max: 255 },
    ),
    isFeatured: optionalBoolean(payload.isFeatured, false),
    isActive: optionalBoolean(payload.isActive, true),
    images,
    features,
    specifications,
  };
};

module.exports = {
  validateProductPayload,
};
