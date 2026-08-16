const mongoose = require("mongoose");
const {
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  COMPLAINT_STATUSES,
} = require("../constants");

/**
 * Complaint Model
 *
 * Core entity of the platform. Tracks citizen-reported issues
 * with location, category, priority, and lifecycle status.
 *
 * AI fields (aiCategory, aiPriority) are stubbed now.
 * GIS fields (latitude, longitude) are included for future mapping features.
 */
const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    // Array of image URLs — will be Cloudinary URLs 
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "A complaint can have at most 5 images",
      },
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: Object.values(COMPLAINT_CATEGORIES),
        message: `Category must be one of: ${Object.values(COMPLAINT_CATEGORIES).join(", ")}`,
      },
    },

    // Free-text sub-category (e.g. "Leakage" under "Water") — the
    // available options are served by GET /api/complaints/meta/categories
    // so the frontend dropdown and translations stay data-driven.
    subCategory: {
      type: String,
      trim: true,
      default: "",
    },

    wardNumber: {
      type: String,
      trim: true,
      maxlength: [20, "Ward number looks too long"],
      default: "",
    },

    priority: {
      type: String,
      enum: {
        values: Object.values(COMPLAINT_PRIORITIES),
        message: `Priority must be one of: ${Object.values(COMPLAINT_PRIORITIES).join(", ")}`,
      },
      default: COMPLAINT_PRIORITIES.MEDIUM,
    },

    status: {
      type: String,
      enum: {
        values: Object.values(COMPLAINT_STATUSES),
        message: `Status must be one of: ${Object.values(COMPLAINT_STATUSES).join(", ")}`,
      },
      default: COMPLAINT_STATUSES.PENDING,
    },

    location: {
      address: {
        type: String,
        trim: true,
      },
      latitude: {
        type: Number,
        min: [-90, "Latitude must be >= -90"],
        max: [90, "Latitude must be <= 90"],
      },
      longitude: {
        type: Number,
        min: [-180, "Longitude must be >= -180"],
        max: [180, "Longitude must be <= 180"],
      },
    },

    // References
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null, // Null until assigned by admin
    },

    // Free-text name shown as "Assigned To" on the complaint detail page
    // (e.g. "Ram Bahadur (Field Officer)") — set by admin/department staff.
    assignedOfficer: {
      type: String,
      trim: true,
      default: "",
    },

    // A running log of every status change, powering the "Status Timeline"
    // on the complaint detail page.
    statusHistory: {
      type: [
        {
          status: { type: String, required: true },
          note: { type: String, trim: true, default: "" },
          changedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    // Citizen/department discussion thread on the complaint.
    comments: {
      type: [
        {
          authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          authorName: { type: String, trim: true },
          message: { type: String, trim: true, required: true, maxlength: 1000 },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    // Lets a citizen flag their own complaint (e.g. "no action taken"),
    // surfaced to admins separately from the normal status flow.
    reports: {
      type: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          reason: { type: String, trim: true, required: true, maxlength: 500 },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    // --- AI-populated fields ---
    aiCategory: {
      type: String,
      default: null, // Will be set by Gemini/OpenAI categorization
    },

    aiPriority: {
      type: String,
      default: null, // Will be set by AI priority detection
    },

    // Lifecycle timestamps
    assignedAt: {
      type: Date,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common query patterns
complaintSchema.index({ userId: 1, status: 1 });
complaintSchema.index({ departmentId: 1, status: 1 });
complaintSchema.index({ category: 1, priority: 1 });
complaintSchema.index({ status: 1, createdAt: -1 });

// Text index for full-text search (dashboard search bar)
complaintSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Complaint", complaintSchema);
