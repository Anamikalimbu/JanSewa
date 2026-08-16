import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { ApiError } from "../utils/sendResponse.js";

/**
 * Protects routes by verifying the JWT access token sent in the
 * Authorization header as "Bearer <token>".
 * Attaches the authenticated user to req.user.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized. Please log in to access this resource.");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired. Please refresh your session.");
    }
    throw new ApiError(401, "Invalid token. Please log in again.");
  }

  const currentUser = await User.findById(decoded.id).select("+passwordChangedAt");
  if (!currentUser) {
    throw new ApiError(401, "The user belonging to this token no longer exists.");
  }

  if (!currentUser.isActive) {
    throw new ApiError(403, "Your account has been deactivated. Contact support.");
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    throw new ApiError(401, "Password was recently changed. Please log in again.");
  }

  req.user = currentUser;
  next();
});

/**
 * Optional authentication - attaches req.user if a valid token is present,
 * but does not block the request if absent/invalid. Useful for public
 * endpoints that behave slightly differently for logged-in users.
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const currentUser = await User.findById(decoded.id);
      if (currentUser && currentUser.isActive) {
        req.user = currentUser;
      }
    } catch (error) {
      // Silently ignore invalid tokens for optional auth
    }
  }
  next();
});
