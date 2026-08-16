const AppError = require("../utils/AppError");

/**
 * middleware/notFound.js
 *
 * Catches requests to routes that don't exist
 * and forwards a 404 AppError to the global error handler.
 * Must be registered AFTER all valid routes.
 */
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

module.exports = notFound;
