const logger = require('../config/logger');

module.exports = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  logger.error(error.message || 'Unhandled error', {
    path: req.originalUrl,
    method: req.method,
    statusCode,
    details: error.details || null,
    stack: error.stack,
  });

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    details: error.details || undefined,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
};
