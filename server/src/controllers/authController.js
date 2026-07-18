const crypto = require("crypto");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const sendEmail = require("../utils/sendEmail");

/**
 * controllers/authController.js
 *
 * All handlers are wrapped in asyncHandler, so thrown AppErrors
 * are forwarded straight to the global error handler.
 */

// --- helper: build the { user, token } payload sent back to the client ---
const buildAuthResponse = (user) => ({
  user,
  token: user.generateAuthToken(),
});

/**
 * POST /api/auth/register
 * Creates a new citizen account and logs them straight in.
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Name, email and password are required.", 400);
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const user = await User.create({ name, email, password, phone });

  sendSuccess(res, 201, "Account created successfully.", buildAuthResponse(user));
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required.", 400);
  }

  // password has `select: false` on the schema, so it must be opted back in
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.isActive) {
    throw new AppError("This account has been deactivated. Please contact support.", 403);
  }

  sendSuccess(res, 200, "Logged in successfully.", buildAuthResponse(user));
});

/**
 * GET /api/auth/me
 * Requires the `protect` middleware — returns the logged-in user's profile.
 * Lets the frontend restore a session after a page refresh.
 */
const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Current user fetched.", { user: req.user });
});

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 *
 * Always responds with a generic success message (whether or not the
 * email exists) so the endpoint can't be used to enumerate registered
 * accounts. If the account exists, a reset link is emailed (or logged
 * to the console when SMTP isn't configured locally).
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError("Email is required.", 400);

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  const genericMessage =
    "If an account with that email exists, a password reset link has been sent.";

  if (!user) {
    return sendSuccess(res, 200, genericMessage);
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const html = `
    <p>Hello ${user.name},</p>
    <p>You requested a password reset for your JanSewa account.</p>
    <p><a href="${resetUrl}">Click here to reset your password</a></p>
    <p>This link expires in 30 minutes. If you didn't request this, you can safely ignore this email.</p>
  `;

  try {
    await sendEmail({ to: user.email, subject: "Reset your JanSewa password", html });
  } catch (err) {
    // Don't leave the user's account stuck with an unusable token if the email fails
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError("Could not send the reset email. Please try again later.", 500);
  }

  const payload = {};
  // Only ever expose the raw token outside of production — this makes the
  // flow testable locally/without real SMTP credentials configured.
  if (process.env.NODE_ENV !== "production") {
    payload.resetToken = resetToken;
    payload.resetUrl = resetUrl;
  }

  sendSuccess(res, 200, genericMessage, payload);
});

/**
 * POST /api/auth/reset-password/:token
 * Body: { password }
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    throw new AppError("Password must be at least 8 characters.", 400);
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+password +passwordResetToken +passwordResetExpires");

  if (!user) {
    throw new AppError("This reset link is invalid or has expired.", 400);
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendSuccess(res, 200, "Password reset successfully. You can now log in.", buildAuthResponse(user));
});

module.exports = { register, login, getMe, forgotPassword, resetPassword };