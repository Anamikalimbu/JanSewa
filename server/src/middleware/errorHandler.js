/**
 * middleware/errorHandler.js
 *
 * Global error handler — must be registered LAST in app.js.
 *
 * Translates known error types (bad JWTs, Mongoose validation/cast
 * errors, duplicate-key errors, Multer upload errors) into clean,
 * user-facing messages with the right status code. Anything else falls
 * back to a generic 500. The full error is always logged server-side,
 * but the stack trace is never sent to the client — that's an internal
 * debugging detail, not something a citizen filing a complaint should see.
 */
const mapKnownError = (err) => {
  // JWT — expired or tampered/invalid token
  if (err.name === "TokenExpiredError") {
    return { statusCode: 401, message: "Your session has expired. Please log in again." };
  }
  if (err.name === "JsonWebTokenError") {
    return { statusCode: 401, message: "Invalid session. Please log in again." };
  }

  // Mongoose — schema validation failed (e.g. missing/too-short fields)
  if (err.name === "ValidationError") {
    const firstMessage = Object.values(err.errors || {})[0]?.message;
    return { statusCode: 400, message: firstMessage || "The submitted data is invalid." };
  }

  // Mongoose — malformed ObjectId in a route param (e.g. /complaints/123)
  if (err.name === "CastError") {
    return { statusCode: 400, message: `Invalid ${err.path || "identifier"}.` };
  }

  // MongoDB — duplicate key (e.g. registering with an email already in use)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || "value";
    return { statusCode: 409, message: `An account with this ${field} already exists.` };
  }

  // Multer — file too large / too many files / wrong field name
  if (err.name === "MulterError") {
    const messages = {
      LIMIT_FILE_SIZE: "Each image must be 5MB or smaller.",
      LIMIT_FILE_COUNT: "You can upload up to 5 images.",
      LIMIT_UNEXPECTED_FILE: "Unexpected file field.",
    };
    return { statusCode: 400, message: messages[err.code] || "There was a problem with your upload." };
  }

  return null;
};

const errorHandler = (err, req, res, next) => {
  const known = mapKnownError(err);
  const statusCode = known?.statusCode || err.statusCode || 500;
  const message =
    known?.message ||
    (err.isOperational ? err.message : null) ||
    (statusCode === 500 ? "Something went wrong on our end. Please try again." : err.message);

  // Always log the full error server-side for debugging, regardless of
  // what we send back to the client.
  console.error(`[${req.method} ${req.originalUrl}]`, err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
};

module.exports = errorHandler;