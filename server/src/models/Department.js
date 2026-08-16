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
      unique: true, // Creates a unique index automatically
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

    // Which complaint categories this department handles (values from
    // COMPLAINT_CATEGORIES, e.g. "Water", "Road"). Used to auto-route a
    // newly-submitted complaint to the right department's queue.
    categories: {
      type: [String],
      default: [],
    },

    // Running counter — incremented when a complaint is assigned,
    // decremented when resolved/closed.
    assignedComplaintsCount: {
      type: Number,
      default: 0,
      min: [0, "Count cannot be negative"],
    },

    // Analytics
    performanceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

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

// Export the model
module.exports = mongoose.model("Department", departmentSchema);