const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const router = express.Router();

/**
 * GET /api/departments
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    sendSuccess(res, 200, "Departments route is active — implementation coming ", {
      departments: [],
    });
  })
);

/**
 * POST /api/departments
 * Admin only — RBAC enforced in Week 3
 */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    sendSuccess(res, 201, "Create department (admin only)", { body: req.body });
  })
);

/**
 * GET /api/departments/:id
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    sendSuccess(res, 200, "Get department by ID", { departmentId: req.params.id });
  })
);

module.exports = router;
