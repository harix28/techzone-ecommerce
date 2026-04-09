const slugify = require('../utils/slugify');
const { optionalBoolean, optionalInteger, optionalString, requiredString } = require('../utils/validation');

const validateCategoryPayload = (payload = {}) => {
  const name = requiredString(payload.name, 'Category name', { min: 2, max: 100 });

  return {
    name,
    slug: optionalString(payload.slug, { max: 120, fallback: slugify(name) }),
    icon: optionalString(payload.icon, { max: 20 }),
    description: optionalString(payload.description, { max: 255 }),
    displayOrder: optionalInteger(payload.displayOrder ?? payload.order, { min: 0, max: 999, fallback: 0 }),
    isActive: optionalBoolean(payload.isActive, true),
  };
};

module.exports = {
  validateCategoryPayload,
};
