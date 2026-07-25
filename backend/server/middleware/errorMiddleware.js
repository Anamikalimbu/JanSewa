import { ApiError } from "../utils/sendResponse.js";

/**
 * Handles requests to undefined routes.
 */
export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found - ${req.originalUrl}`);
  next(error);
};

/**
 * Converts known Mongoose/JWT errors into consistent ApiError instances.
 */
const normalizeError = (err) => {
  let error = err;

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    error = new ApiError(400, `Invalid value for field '${err.path}': ${err.value}`);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = new ApiError(409, `Duplicate value entered for field: '${field}'. Please use another value.`);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new ApiError(400, "Validation failed", messages);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token. Please log in again.");
  }
  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Your session has expired. Please log in again.");
  }

  // Multer errors
  if (err.name === "MulterError") {
    error = new ApiError(400, `File upload error: ${err.message}`);
  }

  return error;
};

/**
 * Centralized error handling middleware.
 * All errors thrown/passed via next(err) anywhere in the app end up here.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const error = normalizeError(err);

  const statusCode = error.statusCode && error.statusCode !== 200 ? error.statusCode : 500;
  const message = error.message || "Internal Server Error";

  if (process.env.NODE_ENV === "development") {
    console.error("🔥 ERROR:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(error.errors && { errors: error.errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
