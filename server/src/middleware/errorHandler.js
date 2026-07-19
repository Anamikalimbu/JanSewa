const { sendError } = require("../utils/apiResponse");

/**
 * middleware/errorHandler.js
 *
 * Global Express error handler — must be the LAST middleware registered.
 * Catches all errors forwarded via next(error).
 *
 * Handles:
 *  - AppError (operational errors thrown intentionally)
 *  - Mongoose ValidationError
 *  - Mongoose CastError (invalid ObjectId)
 *  - Mongoose duplicate key (E11000)
 *  - Unhandled / unexpected errors
 */
const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // --- Mongoose: Invalid ObjectId ---
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for field: ${err.path}`;
  }

  // --- Mongoose: Validation Error ---
  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, 400, "Validation failed", errors);
  }

  // --- MongoDB: Duplicate Key (E11000) ---
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists. Please use a different value.`;
  }

  // --- Multer: file upload errors (size/count limits) ---
  if (err.name === "MulterError") {
    statusCode = 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Each image must be 5MB or smaller."
        : err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE"
        ? "You can upload at most 5 images."
        : err.message;
  }

  // --- JWT: Invalid Token ---
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token. Please log in again.";
  }

  // --- JWT: Expired Token ---
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your session has expired. Please log in again.";
  }

  // Log unexpected (non-operational) errors for debugging
  if (!err.isOperational) {
    console.error("💥 UNEXPECTED ERROR:", err);
  }

  return sendError(res, statusCode, message);
};

module.exports = errorHandler;
