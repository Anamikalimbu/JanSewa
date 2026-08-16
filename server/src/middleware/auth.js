const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const User = require("../models/User");

/**
 * middleware/auth.js
 *
 * protect   — verifies the JWT sent in `Authorization: Bearer <token>`,
 *              loads the user, and attaches it to req.user (departmentId
 *              populated, since several routes read req.user.departmentId._id).
 * authorize — restricts a route to one or more roles. Must run after `protect`.
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Not authorized. Please log in.", 401);
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new AppError("Invalid or expired session. Please log in again.", 401);
  }

  const user = await User.findById(decoded.id).populate("departmentId", "departmentName");
  if (!user) {
    throw new AppError("The user for this session no longer exists.", 401);
  }
  if (!user.isActive) {
    throw new AppError("This account has been deactivated.", 403);
  }

  req.user = user;
  next();
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError("Not authorized. Please log in.", 401);
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError(`Access denied for role '${req.user.role}'.`, 403);
    }
    next();
  };
};

module.exports = { protect, authorize };
