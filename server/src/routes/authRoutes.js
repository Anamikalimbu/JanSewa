const express = require("express");
const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const { ROLES, ADMIN_EMAIL_REGEX } = require("../constants");

const router = express.Router();

// Shape returned for `user` on every auth response — never leak the
// password hash / reset-token fields even though the model already
// strips them in toJSON().
const toAuthUser = (user) => user.toJSON();

/**
 * POST /api/auth/register
 */
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, phone, password, role, departmentId } = req.body;

    if (!name || !email || !password) {
      throw new AppError("Name, email and password are required.", 400);
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      throw new AppError("An account with this email already exists.", 409);
    }

    let requestedRole = role === ROLES.DEPARTMENT ? ROLES.DEPARTMENT : ROLES.CITIZEN;

    if (role === ROLES.ADMIN) {
      if (!ADMIN_EMAIL_REGEX.test(cleanEmail)) {
        throw new AppError(
          "Admin registration requires a reserved admin email in the format admin.<name>@jansewa.gov.np",
          403
        );
      }
      requestedRole = ROLES.ADMIN;
    }

    if (requestedRole === ROLES.DEPARTMENT && !departmentId) {
      throw new AppError("Please select which department you work for.", 400);
    }

    const isApprovalRequired = requestedRole === ROLES.DEPARTMENT || requestedRole === ROLES.ADMIN;

    const user = await User.create({
      name: String(name).trim(),
      email: cleanEmail,
      phone: phone ? String(phone).trim() : undefined,
      password: cleanPassword,
      role: requestedRole,
      departmentId: requestedRole === ROLES.DEPARTMENT ? departmentId : null,
      accountStatus: isApprovalRequired ? "pending" : "approved",
    });

    if (isApprovalRequired) {
      return sendSuccess(res, 201, "Your account request has been submitted and is awaiting admin approval.");
    }

    const token = user.generateAuthToken();

    sendSuccess(res, 201, "Account created successfully.", {
      user: toAuthUser(user),
      token,
    });
  })
);

/**
 * POST /api/auth/login
 */
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password are required.", 400);
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);

    const user = await User.findOne({ email: cleanEmail })
      .select("+password")
      .populate("departmentId", "departmentName");

    if (!user || !(await user.comparePassword(cleanPassword))) {
      throw new AppError("Invalid email or password.", 401);
    }
    if (user.accountStatus === "pending") {
      throw new AppError("Your account is awaiting approval from an administrator.", 403);
    }
    if (user.accountStatus === "rejected") {
      throw new AppError("Your account request was not approved. Contact the administrator for details.", 403);
    }
    if (!user.isActive) {
      throw new AppError("This account has been deactivated.", 403);
    }
    if (user.role === ROLES.ADMIN && !ADMIN_EMAIL_REGEX.test(user.email)) {
      throw new AppError("This admin account is invalid. Contact the system owner.", 403);
    }

    const token = user.generateAuthToken();

    sendSuccess(res, 200, "Logged in successfully.", {
      user: toAuthUser(user),
      token,
    });
  })
);

/**
 * GET /api/auth/me
 */
router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    sendSuccess(res, 200, "Current user fetched.", { user: toAuthUser(req.user) });
  })
);

/**
 * POST /api/auth/forgot-password
 * Always responds with a generic success message (even if the email
 * isn't registered) so the endpoint can't be used to enumerate accounts.
 */
router.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new AppError("Email is required.", 400);

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      const resetToken = user.generatePasswordResetToken();
      await user.save({ validateBeforeSave: false });

      const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

      await sendEmail({
        to: user.email,
        subject: "Reset your JanSewa password",
        html: `<p>Hi ${user.name},</p><p>Click the link below to reset your password. This link expires in 30 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
      });
    }

    sendSuccess(res, 200, "If an account with that email exists, a reset link has been sent.");
  })
);

/**
 * POST /api/auth/reset-password/:token
 */
router.post(
  "/reset-password/:token",
  asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!password || password.length < 8) {
      throw new AppError("Password must be at least 8 characters.", 400);
    }

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      throw new AppError("This reset link is invalid or has expired.", 400);
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = user.generateAuthToken();

    sendSuccess(res, 200, "Password reset successfully.", {
      user: toAuthUser(user),
      token,
    });
  })
);

/**
 * PATCH /api/auth/change-password
 */
router.patch(
  "/change-password",
  protect,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new AppError("Current and new password are required.", 400);
    }
    if (newPassword.length < 8) {
      throw new AppError("New password must be at least 8 characters.", 400);
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(currentPassword))) {
      throw new AppError("Current password is incorrect.", 401);
    }

    user.password = newPassword;
    await user.save();

    sendSuccess(res, 200, "Password changed successfully.");
  })
);

module.exports = router;
