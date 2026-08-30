/**
 * Sends a standardized success response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {object} [data] - Optional payload (can include pagination, meta, etc.)
 */
export const sendSuccess = (res, statusCode = 200, message = "Success", data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

/**
 * Sends a standardized error response.
 * Typically used inside catch blocks or validation failures.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {object} [errors] - Optional validation error details
 */
export const sendError = (res, statusCode = 500, message = "Something went wrong", errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

/**
 * Custom Application Error class used across controllers.
 * Allows centralized error middleware to know the correct status code.
 */
export class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
