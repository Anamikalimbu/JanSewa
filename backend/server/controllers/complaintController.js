import fs from "fs";
import asyncHandler from "express-async-handler";
import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import { ApiError, sendSuccess } from "../utils/sendResponse.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import { createNotification } from "./notificationController.js";

/**
 * @desc    Create a new complaint (citizen)
 * @route   POST /api/v1/complaints
 * @access  Private/Citizen
 */
export const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, department, priority, address, latitude, longitude } = req.body;

  const departmentExists = await Department.findById(department);
  if (!departmentExists) {
    throw new ApiError(404, "Selected department does not exist");
  }

  // Upload images to Cloudinary if provided
  let images = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadToCloudinary(file.path, "jansewa/complaints");
      fs.unlink(file.path, () => {}); // clean up local temp file
      return { url: result.secure_url, publicId: result.public_id };
    });
    images = await Promise.all(uploadPromises);
  }

  const complaint = await Complaint.create({
    title,
    description,
    category,
    department,
    priority: priority || "Medium",
    address,
    location: { latitude: latitude || null, longitude: longitude || null },
    images,
    createdBy: req.user._id,
    statusHistory: [
      {
        status: "Pending",
        remarks: "Complaint registered",
        changedBy: req.user._id,
      },
    ],
  });

  // Notify department head officer if assigned
  if (departmentExists.headOfficer) {
    await createNotification({
      recipient: departmentExists.headOfficer,
      title: "New Complaint Registered",
      message: `A new complaint "${title}" has been registered under your department.`,
      type: "complaint_created",
      relatedComplaint: complaint._id,
    });
  }

  sendSuccess(res, 201, "Complaint registered successfully", { data: { complaint } });
});

/**
 * @desc    Get a single complaint by ID with full details & populated refs
 * @route   GET /api/v1/complaints/:id
 * @access  Private
 */
export const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({ _id: req.params.id, isDeleted: false })
    .populate("createdBy", "name email phone")
    .populate("assignedOfficer", "name email phone")
    .populate("department", "name code")
    .populate("statusHistory.changedBy", "name role");

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // Citizens can only view their own complaints; officers only complaints
  // assigned to them or their department; admins can view all.
  const isOwner = complaint.createdBy._id.toString() === req.user._id.toString();
  const isAssignedOfficer =
    complaint.assignedOfficer && complaint.assignedOfficer._id.toString() === req.user._id.toString();
  const isSameDepartmentOfficer =
    req.user.role === "officer" && req.user.department?.toString() === complaint.department._id.toString();

  if (req.user.role !== "admin" && !isOwner && !isAssignedOfficer && !isSameDepartmentOfficer) {
    throw new ApiError(403, "You are not authorized to view this complaint");
  }

  sendSuccess(res, 200, "Complaint fetched successfully", { data: { complaint } });
});

/**
 * @desc    Get all complaints with search, filter, sort & pagination.
 *          Citizens see only their own; officers see their department's;
 *          admins see all.
 * @route   GET /api/v1/complaints
 * @access  Private
 */
export const getAllComplaints = asyncHandler(async (req, res) => {
  let baseFilter = { isDeleted: false };

  if (req.user.role === "citizen") {
    baseFilter.createdBy = req.user._id;
  } else if (req.user.role === "officer") {
    baseFilter.$or = [{ department: req.user.department }, { assignedOfficer: req.user._id }];
  }
  // admin sees everything - no additional filter

  const totalComplaints = await Complaint.countDocuments(baseFilter);

  const features = new ApiFeatures(
    Complaint.find(baseFilter)
      .populate("createdBy", "name email")
      .populate("assignedOfficer", "name email")
      .populate("department", "name code"),
    req.query
  )
    .search(["title", "description", "address"])
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const complaints = await features.query;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  sendSuccess(res, 200, "Complaints fetched successfully", {
    data: { complaints },
    pagination: { total: totalComplaints, page, limit, pages: Math.ceil(totalComplaints / limit) },
  });
});

/**
 * @desc    Update complaint details (only by owner, only while Pending)
 * @route   PATCH /api/v1/complaints/:id
 * @access  Private/Citizen (owner)
 */
export const updateComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({ _id: req.params.id, isDeleted: false });

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  const isOwner = complaint.createdBy.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "You are not authorized to update this complaint");
  }

  if (complaint.status !== "Pending" && req.user.role !== "admin") {
    throw new ApiError(400, "Complaint can only be edited while it is still Pending");
  }

  const allowedFields = ["title", "description", "category", "priority", "address"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) complaint[field] = req.body[field];
  });

  if (req.body.latitude !== undefined) complaint.location.latitude = req.body.latitude;
  if (req.body.longitude !== undefined) complaint.location.longitude = req.body.longitude;

  // Handle new images (append to existing)
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadToCloudinary(file.path, "jansewa/complaints");
      fs.unlink(file.path, () => {});
      return { url: result.secure_url, publicId: result.public_id };
    });
    const newImages = await Promise.all(uploadPromises);
    complaint.images.push(...newImages);
  }

  await complaint.save();

  sendSuccess(res, 200, "Complaint updated successfully", { data: { complaint } });
});

/**
 * @desc    Soft-delete a complaint
 * @route   DELETE /api/v1/complaints/:id
 * @access  Private/Citizen (owner) or Admin
 */
export const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({ _id: req.params.id, isDeleted: false });

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  const isOwner = complaint.createdBy.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "You are not authorized to delete this complaint");
  }

  complaint.isDeleted = true;
  await complaint.save({ validateBeforeSave: false });

  sendSuccess(res, 200, "Complaint deleted successfully");
});

/**
 * @desc    Update complaint status (officer/admin) - pushes to statusHistory
 * @route   PATCH /api/v1/complaints/:id/status
 * @access  Private/Officer,Admin
 */
export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;

  const complaint = await Complaint.findOne({ _id: req.params.id, isDeleted: false });
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  if (
    req.user.role === "officer" &&
    complaint.assignedOfficer?.toString() !== req.user._id.toString() &&
    complaint.department.toString() !== req.user.department?.toString()
  ) {
    throw new ApiError(403, "You are not authorized to update this complaint's status");
  }

  complaint.status = status;
  if (remarks) complaint.resolutionRemarks = remarks;
  if (status === "Resolved") complaint.resolvedAt = new Date();

  complaint.statusHistory.push({
    status,
    remarks: remarks || "",
    changedBy: req.user._id,
  });

  await complaint.save();

  // Notify the citizen who created the complaint
  await createNotification({
    recipient: complaint.createdBy,
    title: "Complaint Status Updated",
    message: `Your complaint "${complaint.title}" status changed to "${status}".`,
    type: "status_update",
    relatedComplaint: complaint._id,
  });

  sendSuccess(res, 200, "Complaint status updated successfully", { data: { complaint } });
});

/**
 * @desc    Assign an officer to a complaint (admin/department head)
 * @route   PATCH /api/v1/complaints/:id/assign
 * @access  Private/Admin
 */
export const assignOfficer = asyncHandler(async (req, res) => {
  const { officerId } = req.body;

  const complaint = await Complaint.findOne({ _id: req.params.id, isDeleted: false });
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  const officer = await User.findOne({ _id: officerId, role: "officer", isActive: true });
  if (!officer) {
    throw new ApiError(404, "Officer not found or inactive");
  }

  complaint.assignedOfficer = officer._id;
  if (complaint.status === "Pending") {
    complaint.status = "Under Review";
  }

  complaint.statusHistory.push({
    status: complaint.status,
    remarks: `Assigned to officer ${officer.name}`,
    changedBy: req.user._id,
  });

  await complaint.save();

  await createNotification({
    recipient: officer._id,
    title: "New Complaint Assigned",
    message: `You have been assigned complaint "${complaint.title}".`,
    type: "assignment",
    relatedComplaint: complaint._id,
  });

  sendSuccess(res, 200, "Officer assigned successfully", { data: { complaint } });
});

/**
 * @desc    Get the full status history / audit trail of a complaint
 * @route   GET /api/v1/complaints/:id/history
 * @access  Private
 */
export const getComplaintHistory = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({ _id: req.params.id, isDeleted: false })
    .select("title status statusHistory createdBy")
    .populate("statusHistory.changedBy", "name role");

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  const isOwner = complaint.createdBy.toString() === req.user._id.toString();
  if (req.user.role === "citizen" && !isOwner) {
    throw new ApiError(403, "You are not authorized to view this complaint's history");
  }

  sendSuccess(res, 200, "Complaint history fetched successfully", {
    data: { title: complaint.title, currentStatus: complaint.status, history: complaint.statusHistory },
  });
});

/**
 * @desc    Remove a single image from a complaint
 * @route   DELETE /api/v1/complaints/:id/images/:imageId
 * @access  Private/Citizen (owner)
 */
export const deleteComplaintImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;

  const complaint = await Complaint.findOne({ _id: id, isDeleted: false });
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  const isOwner = complaint.createdBy.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "You are not authorized to modify this complaint");
  }

  const image = complaint.images.id(imageId);
  if (!image) {
    throw new ApiError(404, "Image not found on this complaint");
  }

  await deleteFromCloudinary(image.publicId);
  image.deleteOne();
  await complaint.save();

  sendSuccess(res, 200, "Image removed successfully", { data: { complaint } });
});

/**
 * @desc    Upvote / remove-upvote a complaint (citizen engagement feature)
 * @route   PATCH /api/v1/complaints/:id/upvote
 * @access  Private/Citizen
 */
export const toggleUpvote = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({ _id: req.params.id, isDeleted: false });
  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  const alreadyUpvoted = complaint.upvotes.some((u) => u.toString() === req.user._id.toString());

  if (alreadyUpvoted) {
    complaint.upvotes = complaint.upvotes.filter((u) => u.toString() !== req.user._id.toString());
  } else {
    complaint.upvotes.push(req.user._id);
  }

  await complaint.save({ validateBeforeSave: false });

  sendSuccess(res, 200, alreadyUpvoted ? "Upvote removed" : "Complaint upvoted", {
    data: { upvoteCount: complaint.upvotes.length },
  });
});
