/**
 * utils/AppError.js
 *
 * Custom error class that carries an HTTP status code.
 * Throwing an AppError anywhere in the app routes it
 * cleanly through the global error handler.
 *
 * Usage:
 *   throw new AppError("Complaint not found", 404);
 *   throw new AppError("Not authorised", 403);
 */
class AppError extends Error {
  /**
   * @param {string} message   - Human-readable error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguish from unexpected programming errors

    // Preserve correct stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
