const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const User = require("../models/User");

/**
 * middleware/auth.js
 *
 * protect: verifies the Bearer JWT on the request, loads the
 * corresponding user, and attaches it to req.user.
 *
 * authorize(...roles): must be used AFTER protect. Restricts a
 * route to one or more roles (e.g. authorize("admin")).
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Not authorised. Please log in to access this resource.", 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError("The user belonging to this token no longer exists.", 401);
  }

  if (!user.isActive) {
    throw new AppError("This account has been deactivated.", 403);
  }

  req.user = user;
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError("You do not have permission to perform this action.", 403));
  }
  next();
};

module.exports = { protect, authorize };
