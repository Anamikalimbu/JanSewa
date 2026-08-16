import { validationResult } from "express-validator";
import { ApiError } from "../utils/sendResponse.js";

/**
 * Runs after express-validator rule chains. If validation errors exist,
 * throws a formatted ApiError which is caught by the centralized error handler.
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    throw new ApiError(422, "Validation failed", formattedErrors);
  }
  next();
};
