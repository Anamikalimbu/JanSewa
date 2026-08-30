/**
 * utils/apiResponse.js
 *
 * Standardised JSON response helpers.
 * Using these everywhere ensures a consistent API contract
 * that the frontend (and future mobile clients) can always rely on.
 *
 * Success shape:   { success: true,  data: {...},    message: "..." }
 * Error shape:     { success: false, error: "...",   message: "..." }
 * Paginated shape: { success: true,  data: [...],    pagination: {...} }
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {string} message    - Human-readable success message
 * @param {*} data            - Response payload
 */
const sendSuccess = (res, statusCode = 200, message = "Success", data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {string} message    - Human-readable error message
 * @param {*} errors          - Optional field-level errors (e.g., validation)
 */
const sendError = (res, statusCode = 500, message = "Internal Server Error", errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

/**
 * Send a paginated success response.
 * @param {import('express').Response} res
 * @param {Array}  data       - Array of items for current page
 * @param {number} page       - Current page number
 * @param {number} limit      - Items per page
 * @param {number} total      - Total number of items
 * @param {string} message
 */
const sendPaginated = (res, data, page, limit, total, message = "Success") => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
};

module.exports = { sendSuccess, sendError, sendPaginated };
