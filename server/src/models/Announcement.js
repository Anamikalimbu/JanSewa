const mongoose = require("mongoose");
const { ANNOUNCEMENT_CATEGORIES } = require("../constants");

/**
 * Announcement Model
 *
 * Admin-authored notices shown on the public Announcements page (e.g.
 * scheduled maintenance, new policies, service alerts). Pinned
 * announcements are always shown first, most recent next.
 */
const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [5, "Message must be at least 5 characters"],
      maxlength: [3000, "Message cannot exceed 3000 characters"],
    },

    category: {
      type: String,
      enum: {
        values: Object.values(ANNOUNCEMENT_CATEGORIES),
        message: `Category must be one of: ${Object.values(ANNOUNCEMENT_CATEGORIES).join(", ")}`,
      },
      default: ANNOUNCEMENT_CATEGORIES.GENERAL,
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

announcementSchema.index({ isActive: 1, isPinned: -1, createdAt: -1 });

module.exports = mongoose.model("Announcement", announcementSchema);
