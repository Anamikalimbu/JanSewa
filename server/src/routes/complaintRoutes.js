const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const router = express.Router();

/**
 * GET /api/complaints
 * Placeholder — full CRUD in Week 4
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    sendSuccess(res, 200, "Complaints route is active — implementation coming", {
      complaints: [],
      pagination: { page: 1, limit: 10, total: 0 },
    });
  })
);

/**
 * POST /api/complaints
 */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    sendSuccess(res, 201, "Create complaint", { body: req.body });
  })
);

/**
 * GET /api/complaints/:id
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    sendSuccess(res, 200, "Get complaint by ID", { complaintId: req.params.id });
  })
);

/**
 * PATCH /api/complaints/:id/status
 * Status update endpoint (admin / department officer)
 */
router.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    sendSuccess(res, 200, "Update complaint status", {
      complaintId: req.params.id,
      status: req.body.status,
    });
  })
);

module.exports = router;
