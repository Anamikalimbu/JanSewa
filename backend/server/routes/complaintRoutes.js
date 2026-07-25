import express from "express";
import {
  createComplaint,
  getComplaintById,
  getAllComplaints,
  updateComplaint,
  deleteComplaint,
  updateComplaintStatus,
  assignOfficer,
  getComplaintHistory,
  deleteComplaintImage,
  toggleUpvote,
} from "../controllers/complaintController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { uploadComplaintImages } from "../middleware/uploadMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createComplaintValidator,
  updateComplaintValidator,
  updateStatusValidator,
  assignOfficerValidator,
  mongoIdParamValidator,
} from "../validators/complaintValidator.js";

const router = express.Router();

// All complaint routes require authentication
router.use(protect);

router
  .route("/")
  .post(
    authorizeRoles("citizen"),
    uploadComplaintImages,
    createComplaintValidator,
    validateRequest,
    createComplaint
  )
  .get(getAllComplaints); // filtered internally based on role

router
  .route("/:id")
  .get(mongoIdParamValidator, validateRequest, getComplaintById)
  .patch(uploadComplaintImages, updateComplaintValidator, validateRequest, updateComplaint)
  .delete(mongoIdParamValidator, validateRequest, deleteComplaint);

router.patch(
  "/:id/status",
  authorizeRoles("officer", "admin"),
  updateStatusValidator,
  validateRequest,
  updateComplaintStatus
);

router.patch(
  "/:id/assign",
  authorizeRoles("admin"),
  assignOfficerValidator,
  validateRequest,
  assignOfficer
);

router.get("/:id/history", mongoIdParamValidator, validateRequest, getComplaintHistory);

router.delete("/:id/images/:imageId", deleteComplaintImage);

router.patch("/:id/upvote", authorizeRoles("citizen"), mongoIdParamValidator, validateRequest, toggleUpvote);

export default router;
