const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendPaginated } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const { protect, authorize } = require("../middleware/auth");
const User = require("../models/User");
const { ROLES } = require("../constants");

const router = express.Router();

// Every route here requires a logged-in user
router.use(protect);

/**
 * GET /api/users?page=1&limit=5&search=&role=
 * Admin only — powers the "Recent Users" table and the Users management page.
 */
router.get(
  "/",
  authorize(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 5, 100);
    const { search, role } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { email: rx }];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("departmentId", "departmentName"),
      User.countDocuments(filter),
    ]);

    sendPaginated(res, users, page, limit, total, "Users fetched");
  })
);

/**
 * GET /api/users/:id
 * A user can view their own profile; admins can view anyone's.
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    if (req.user.role !== ROLES.ADMIN && String(req.user._id) !== req.params.id) {
      throw new AppError("You do not have permission to view this profile.", 403);
    }

    const user = await User.findById(req.params.id).populate("departmentId", "departmentName");
    if (!user) throw new AppError("User not found.", 404);

    sendSuccess(res, 200, "User fetched", { user });
  })
);

/**
 * PATCH /api/users/:id
 * A user can update their own name/phone; admins can also update isActive.
 */
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const isSelf = String(req.user._id) === req.params.id;
    if (!isSelf && req.user.role !== ROLES.ADMIN) {
      throw new AppError("You do not have permission to update this profile.", 403);
    }

    const user = await User.findById(req.params.id);
    if (!user) throw new AppError("User not found.", 404);

    const { name, phone, isActive } = req.body;
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined && req.user.role === ROLES.ADMIN) user.isActive = isActive;

    await user.save();
    sendSuccess(res, 200, "Profile updated.", { user });
  })
);

/**
 * PATCH /api/users/:id/role
 * Admin only — changes a user's role (e.g. citizen -> department staff),
 * optionally assigning them to a department at the same time.
 */
router.patch(
  "/:id/role",
  authorize(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const { role, departmentId } = req.body;

    if (!role || !Object.values(ROLES).includes(role)) {
      throw new AppError(`Role must be one of: ${Object.values(ROLES).join(", ")}`, 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) throw new AppError("User not found.", 404);

    user.role = role;
    user.departmentId = role === ROLES.DEPARTMENT ? departmentId || user.departmentId : null;
    await user.save();

    sendSuccess(res, 200, "User role updated.", { user });
  })
);

module.exports = router;
