import fs from "fs";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import { ApiError, sendSuccess } from "../utils/sendResponse.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

/**
 * @desc    Upload/update logged-in user's avatar
 * @route   PATCH /api/v1/users/avatar
 * @access  Private
 */
export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please upload an image file");
  }

  const user = await User.findById(req.user._id);

  // Remove old avatar from Cloudinary if it exists
  if (user.avatar?.publicId) {
    await deleteFromCloudinary(user.avatar.publicId);
  }

  const result = await uploadToCloudinary(req.file.path, "jansewa/avatars");

  user.avatar = { url: result.secure_url, publicId: result.public_id };
  await user.save({ validateBeforeSave: false });

  // Clean up local temp file
  fs.unlink(req.file.path, () => {});

  sendSuccess(res, 200, "Avatar updated successfully", { data: { user } });
});

/**
 * @desc    Get single user by ID (admin only, or officer viewing citizen info)
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate("department", "name code");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  sendSuccess(res, 200, "User fetched successfully", { data: { user } });
});

/**
 * @desc    Get all users with search, filter & pagination (admin only)
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();

  const features = new ApiFeatures(User.find().populate("department", "name code"), req.query)
    .search(["name", "email", "phone"])
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  sendSuccess(res, 200, "Users fetched successfully", {
    data: { users },
    pagination: { total: totalUsers, page, limit, pages: Math.ceil(totalUsers / limit) },
  });
});

/**
 * @desc    Update a user's role or active status (admin only)
 * @route   PATCH /api/v1/users/:id
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req, res) => {
  const allowedFields = ["role", "isActive", "department", "name", "phone"];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  sendSuccess(res, 200, "User updated successfully", { data: { user } });
});

/**
 * @desc    Delete (deactivate) a user account (admin only)
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  sendSuccess(res, 200, "User deactivated successfully");
});

/**
 * @desc    Get all officers (used for assigning complaints), optionally filtered by department
 * @route   GET /api/v1/users/officers/list
 * @access  Private/Admin,Officer
 */
export const getOfficers = asyncHandler(async (req, res) => {
  const filter = { role: "officer", isActive: true };
  if (req.query.department) filter.department = req.query.department;

  const officers = await User.find(filter).populate("department", "name code");
  sendSuccess(res, 200, "Officers fetched successfully", { data: { officers } });
});
