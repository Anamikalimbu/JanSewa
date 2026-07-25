import { ApiError } from "../utils/sendResponse.js";

/**
 * Restricts route access to specific roles.
 * Must be used AFTER the `protect` middleware, since it relies on req.user.
 *
 * Usage: router.get('/admin-only', protect, authorizeRoles('admin'), handler)
 *
 * @param  {...string} roles - Allowed roles e.g. 'admin', 'officer', 'citizen'
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Not authorized. Please log in first.");
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. Role '${req.user.role}' is not permitted to perform this action.`
      );
    }

    next();
  };
};

/**
 * Ensures the requesting user is either the resource owner or an admin.
 * @param {Function} getResourceOwnerId - function(req) => ownerId (string)
 */
export const authorizeOwnerOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Not authorized. Please log in first.");
    }

    if (req.user.role === "admin") return next();

    const ownerId = await getResourceOwnerId(req);
    if (!ownerId || ownerId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to perform this action.");
    }

    next();
  };
};
