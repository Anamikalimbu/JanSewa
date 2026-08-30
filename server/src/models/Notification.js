const mongoose = require("mongoose");
const { NOTIFICATION_TYPES } = require("../constants");

/**
 * Notification Model
 *
 * In-app notifications for citizens and department officers.
 * Real-time delivery via Socket.io 
 * Email/SMS notifications will trigger alongside these records.
 */
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },

    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },

    type: {
      type: String,
      required: [true, "Notification type is required"],
      enum: {
        values: Object.values(NOTIFICATION_TYPES),
        message: `Type must be one of: ${Object.values(NOTIFICATION_TYPES).join(", ")}`,
      },
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    // Optional: link back to the relevant complaint
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Fast lookup for a user's unread notifications
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
