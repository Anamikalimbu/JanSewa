import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";
import { ApiError, sendSuccess } from "../utils/sendResponse.js";

/**
 * Internal helper (not an HTTP handler) used by other controllers
 * (e.g. complaintController) to create a notification for a user.
 * @param {{recipient: string, title: string, message: string, type?: string, relatedComplaint?: string}} data
 */
export const createNotification = async ({ recipient, title, message, type = "general", relatedComplaint = null }) => {
  return Notification.create({ recipient, title, message, type, relatedComplaint });
};

/**
 * @desc    Create a notification manually (admin/system use)
 * @route   POST /api/v1/notifications
 * @access  Private/Admin
 */
export const createNotificationHandler = asyncHandler(async (req, res) => {
  const { recipient, title, message, type, relatedComplaint } = req.body;

  const notification = await createNotification({ recipient, title, message, type, relatedComplaint });

  sendSuccess(res, 201, "Notification created successfully", { data: { notification } });
});

/**
 * @desc    Get all notifications for the logged-in user
 * @route   GET /api/v1/notifications
 * @access  Private
 */
export const getMyNotifications = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = { recipient: req.user._id };
  if (req.query.isRead !== undefined) filter.isRead = req.query.isRead === "true";

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

  const notifications = await Notification.find(filter)
    .sort("-createdAt")
    .skip(skip)
    .limit(limit)
    .populate("relatedComplaint", "title status");

  sendSuccess(res, 200, "Notifications fetched successfully", {
    data: { notifications, unreadCount },
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
});

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/v1/notifications/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  sendSuccess(res, 200, "Notification marked as read", { data: { notification } });
});

/**
 * @desc    Mark all notifications for the logged-in user as read
 * @route   PATCH /api/v1/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  sendSuccess(res, 200, "All notifications marked as read");
});

/**
 * @desc    Delete a notification
 * @route   DELETE /api/v1/notifications/:id
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  sendSuccess(res, 200, "Notification deleted successfully");
});
