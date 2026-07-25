import express from "express";
import {
  updateAvatar,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getOfficers,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { uploadAvatar } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

// Logged-in user's own avatar
router.patch("/avatar", uploadAvatar, updateAvatar);

// Officers list (used for assignment dropdowns) - admin & officer accessible
router.get("/officers/list", authorizeRoles("admin", "officer"), getOfficers);

// Admin-only user management
router.get("/", authorizeRoles("admin"), getAllUsers);
router.get("/:id", authorizeRoles("admin"), getUserById);
router.patch("/:id", authorizeRoles("admin"), updateUser);
router.delete("/:id", authorizeRoles("admin"), deleteUser);

export default router;
