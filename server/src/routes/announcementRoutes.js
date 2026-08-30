const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendPaginated } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const { protect, authorize } = require("../middleware/auth");
const Announcement = require("../models/Announcement");
const { ROLES, ANNOUNCEMENT_CATEGORIES } = require("../constants");

const router = express.Router();

/**
 * GET /api/announcements
 * Public — powers the Announcements page. Pinned announcements always
 * appear first, then most-recent first. Supports optional category filter
 * and pagination.
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const { category } = req.query;

    // Admins reviewing the management table can see inactive ones too
    const includeInactive = req.query.includeInactive === "true";
    const filter = includeInactive ? {} : { isActive: true };
    if (category) filter.category = category;

    const [announcements, total] = await Promise.all([
      Announcement.find(filter)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Announcement.countDocuments(filter),
    ]);

    sendPaginated(res, announcements, page, limit, total, "Announcements fetched");
  })
);

/**
 * GET /api/announcements/meta/categories
 * Public — category options for filters/forms.
 */
router.get(
  "/meta/categories",
  asyncHandler(async (req, res) => {
    sendSuccess(res, 200, "Categories fetched", { categories: Object.values(ANNOUNCEMENT_CATEGORIES) });
  })
);

/**
 * GET /api/announcements/:id
 * Public — single announcement detail.
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) throw new AppError("Announcement not found.", 404);
    sendSuccess(res, 200, "Announcement fetched", { announcement });
  })
);

/**
 * POST /api/announcements
 * Admin only — publish a new announcement.
 */
router.post(
  "/",
  protect,
  authorize(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const { title, message, category, isPinned } = req.body;

    if (!title || !message) {
      throw new AppError("Title and message are required.", 400);
    }

    const announcement = await Announcement.create({
      title,
      message,
      category,
      isPinned: !!isPinned,
      createdBy: req.user._id,
    });

    sendSuccess(res, 201, "Announcement published successfully.", { announcement });
  })
);

/**
 * PATCH /api/announcements/:id
 * Admin only — edit, pin/unpin, or archive an announcement.
 */
router.patch(
  "/:id",
  protect,
  authorize(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const allowedFields = ["title", "message", "category", "isPinned", "isActive"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const announcement = await Announcement.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!announcement) throw new AppError("Announcement not found.", 404);
    sendSuccess(res, 200, "Announcement updated successfully.", { announcement });
  })
);

/**
 * DELETE /api/announcements/:id
 * Admin only — permanently delete an announcement.
 */
router.delete(
  "/:id",
  protect,
  authorize(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) throw new AppError("Announcement not found.", 404);
    sendSuccess(res, 200, "Announcement deleted successfully.");
  })
);

module.exports = router;
