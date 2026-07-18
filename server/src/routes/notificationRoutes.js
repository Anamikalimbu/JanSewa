const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const { protect } = require("../middleware/auth");
const Notification = require("../models/Notification");

const router = express.Router();

// Every notification route requires a logged-in user
router.use(protect);

/**
 * GET /api/notifications?limit=10
 * Returns the current user's notifications, most recent first.
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(limit),
      Notification.countDocuments({ userId: req.user._id, isRead: false }),
    ]);

    sendSuccess(res, 200, "Notifications fetched", { notifications, unreadCount });
  })
);

/**
 * GET /api/notifications/unread-count
 * Lightweight endpoint for the navbar bell badge.
 */
router.get(
  "/unread-count",
  asyncHandler(async (req, res) => {
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });
    sendSuccess(res, 200, "Unread count fetched", { unreadCount });
  })
);

/**
 * PATCH /api/notifications/:id/read
 */
router.patch(
  "/:id/read",
  asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) throw new AppError("Notification not found.", 404);

    notification.isRead = true;
    await notification.save();

    sendSuccess(res, 200, "Notification marked as read.", { notification });
  })
);

/**
 * PATCH /api/notifications/read-all
 */
router.patch(
  "/read-all",
  asyncHandler(async (req, res) => {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    sendSuccess(res, 200, "All notifications marked as read.");
  })
);

module.exports = router;
