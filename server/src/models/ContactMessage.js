const mongoose = require("mongoose");
const { CONTACT_STATUSES } = require("../constants");

/**
 * ContactMessage Model
 *
 * Submissions from the public Contact page. Doesn't require an account —
 * anyone can reach out. Admins can review these from the admin panel.
 */
const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    subject: {
      type: String,
      trim: true,
      maxlength: [150, "Subject cannot exceed 150 characters"],
      default: "General Inquiry",
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [10, "Message must be at least 10 characters"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },

    status: {
      type: String,
      enum: {
        values: Object.values(CONTACT_STATUSES),
        message: `Status must be one of: ${Object.values(CONTACT_STATUSES).join(", ")}`,
      },
      default: CONTACT_STATUSES.NEW,
    },
  },
  { timestamps: true }
);

contactMessageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
