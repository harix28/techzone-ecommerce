const { optionalString, requiredInteger, requiredString } = require('../utils/validation');

const validateReviewPayload = (payload = {}) => ({
  rating: requiredInteger(payload.rating, 'Rating', { min: 1, max: 5 }),
  title: optionalString(payload.title, { max: 120 }),
  comment: requiredString(payload.comment, 'Comment', { min: 10, max: 2000 }),
});

module.exports = {
  validateReviewPayload,
};
