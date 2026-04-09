const ApiError = require('../utils/api-error');

module.exports = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};
