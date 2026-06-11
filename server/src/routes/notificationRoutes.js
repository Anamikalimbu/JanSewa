const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const router = express.Router();

/**
 * GET /api/notifications
 * Returns notifications for the authenticated user 
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    sendSuccess(res, 200, "Notifications route is active", {
      notifications: [],
    });
  })
);

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
router.patch(
  "/:id/read",
  asyncHandler(async (req, res) => {
    sendSuccess(res, 200, "Mark notification as read", { notificationId: req.params.id });
  })
);

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications for current user as read
 */
router.patch(
  "/read-all",
  asyncHandler(async (req, res) => {
    sendSuccess(res, 200, "Mark all notifications as read", { userId: req.user.id });
  })
);

module.exports = router;
