import express from "express";
import {
  getDashboardSummary,
  getComplaintAnalytics,
  getMonthlyReport,
  getCategoryStats,
  getDepartmentStats,
  createDepartment,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Any authenticated user can view the list of departments (needed when
// filing a complaint), but only admins can create/modify/delete them.
router.get("/departments", protect, getAllDepartments);

// All routes below require authentication + admin role
router.use(protect, authorizeRoles("admin"));

// Dashboard analytics
router.get("/dashboard/summary", getDashboardSummary);
router.get("/dashboard/analytics", getComplaintAnalytics);
router.get("/dashboard/monthly-report", getMonthlyReport);
router.get("/dashboard/category-stats", getCategoryStats);
router.get("/dashboard/department-stats", getDepartmentStats);

// Department management (write operations - admin only)
router.post("/departments", createDepartment);
router.patch("/departments/:id", updateDepartment);
router.delete("/departments/:id", deleteDepartment);

export default router;
