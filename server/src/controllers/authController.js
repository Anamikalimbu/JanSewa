import crypto from "crypto";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { ApiError, sendSuccess } from "../utils/sendResponse.js";
import { issueTokens, generateAccessToken } from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";

/**
 * @desc    Register a new user (citizen by default)
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, department } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    throw new ApiError(409, "A user with this email or phone number already exists");
  }

  // Prevent public self-registration as admin; only 'citizen' or 'officer' allowed via API
  const assignedRole = role === "officer" ? "officer" : "citizen";

  if (assignedRole === "officer" && !department) {
    throw new ApiError(400, "Department is required when registering as an officer");
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: assignedRole,
    department: assignedRole === "officer" ? department : undefined,
  });

  const { accessToken } = issueTokens(res, user._id);

  sendSuccess(res, 201, "Registration successful", {
    data: { user, accessToken },
  });
});

/**
 * @desc    Login user and issue access/refresh tokens
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated. Please contact support.");
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const { accessToken } = issueTokens(res, user._id);

  sendSuccess(res, 200, "Login successful", {
    data: { user, accessToken },
  });
});

/**
 * @desc    Logout user - clears refresh token cookie
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", { path: "/api/v1/auth" });
  sendSuccess(res, 200, "Logged out successfully");
});

/**
 * @desc    Issue a new access token using a valid refresh token cookie
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public (requires valid refresh cookie)
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new ApiError(401, "Refresh token missing. Please log in again.");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token. Please log in again.");
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new ApiError(401, "User not found or inactive");
  }

  const accessToken = generateAccessToken(user._id);

  sendSuccess(res, 200, "Access token refreshed", { data: { accessToken } });
});

/**
 * @desc    Send password reset link/token to user's email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Do not reveal whether the email exists, for security reasons
    return sendSuccess(res, 200, "If that email exists, a password reset link has been sent");
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const message = `
    <h2>JanSewa Password Reset</h2>
    <p>You requested a password reset. Click the link below to set a new password:</p>
    <a href="${resetUrl}" target="_blank">${resetUrl}</a>
    <p>This link is valid for 10 minutes. If you did not request this, please ignore this email.</p>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: "JanSewa - Password Reset Request",
      html: message,
    });
    sendSuccess(res, 200, "If that email exists, a password reset link has been sent");
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, "Error sending password reset email. Please try again later.");
  }
});

/**
 * @desc    Reset password using token received via email
 * @route   PATCH /api/v1/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    throw new ApiError(400, "Password reset token is invalid or has expired");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const { accessToken } = issueTokens(res, user._id);

  sendSuccess(res, 200, "Password reset successful", { data: { accessToken } });
});

/**
 * @desc    Change password while logged in
 * @route   PATCH /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  const { accessToken } = issueTokens(res, user._id);

  sendSuccess(res, 200, "Password changed successfully", { data: { accessToken } });
});

/**
 * @desc    Get currently logged in user's profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("department", "name code");
  sendSuccess(res, 200, "Profile fetched successfully", { data: { user } });
});

/**
 * @desc    Update logged-in user's profile (name, phone, address, avatar)
 * @route   PATCH /api/v1/auth/update-profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "phone", "address"];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (req.file) {
    // Avatar upload is handled in userController via Cloudinary; here we just
    // support direct URL assignment if passed (kept minimal for auth controller).
    updates.avatar = { url: req.file.path, publicId: req.file.filename };
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, 200, "Profile updated successfully", { data: { user } });
});
