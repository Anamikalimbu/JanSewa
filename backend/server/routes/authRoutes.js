import express from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  updateProfileValidator,
} from "../validators/authValidator.js";

const router = express.Router();

// Public routes
router.post("/register", registerValidator, validateRequest, register);
router.post("/login", loginValidator, validateRequest, login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPasswordValidator, validateRequest, forgotPassword);
router.patch("/reset-password/:token", resetPasswordValidator, validateRequest, resetPassword);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.patch("/change-password", protect, changePasswordValidator, validateRequest, changePassword);
router.patch("/update-profile", protect, updateProfileValidator, validateRequest, updateProfile);

export default router;
