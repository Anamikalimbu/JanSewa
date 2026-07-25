import mongoose from "mongoose";

// Sub-schema to track every status change for full complaint history/audit trail
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Pending", "Under Review", "In Progress", "Resolved", "Rejected"],
      required: true,
    },
    remarks: { type: String, default: "" },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Complaint description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Under Review", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolutionRemarks: {
      type: String,
      default: "",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    statusHistory: [statusHistorySchema],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Indexes to speed up filtering, searching, sorting on the complaints list
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ department: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ createdBy: 1 });
complaintSchema.index({ assignedOfficer: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ title: "text", description: "text", address: "text" });

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;
