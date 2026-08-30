const mongoose = require("mongoose");

/**
 * Feedback Model
 *
 * A citizen's star rating + optional comment left on a complaint once it
 * has been Resolved/Closed. One feedback entry per complaint — powers the
 * "Citizen Feedback" section on the complaint detail page and the Admin
 * Feedback dashboard (average rating, recent comments).
 */
const feedbackSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: [true, "Complaint reference is required"],
      unique: true, // one feedback per complaint
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },

    rating: {
      type: Number,
      required: [true, "A rating between 1 and 5 is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    message: {
      type: String,
      trim: true,
      maxlength: [1000, "Feedback message cannot exceed 1000 characters"],
      default: "",
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
