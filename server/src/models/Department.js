const mongoose = require("mongoose");

/**
 * Department Model
 *
 * Represents government departments that handle complaints
 * (e.g., Roads Dept, Water Supply, NEA).
 *
 * Analytics fields (performanceScore, averageResolutionTime)
 */
const departmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
      trim: true,
      maxlength: [150, "Department name cannot exceed 150 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    // Running counter — incremented when a complaint is assigned,
    // decremented when resolved/closed. Avoids expensive COUNT queries.
    assignedComplaintsCount: {
      type: Number,
      default: 0,
      min: [0, "Count cannot be negative"],
    },

    // --- Analytics fields ---
    performanceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null, // Computed from resolution rate + time
    },

    // Average time (in hours) to resolve a complaint
    averageResolutionTime: {
      type: Number,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

departmentSchema.index({ departmentName: 1 });

module.exports = mongoose.model("Department", departmentSchema);
