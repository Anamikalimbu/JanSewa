// backend/src/routes/complaintRoutes.js
// Add this route to your existing complaintRoutes.js file

const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const Complaint = require("../models/Complaint");

const router = express.Router();

/**
 * GET /api/complaints/stats
 * Public endpoint — returns aggregate stats for the landing page.
 */
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    // Count total complaints
    const total = await Complaint.countDocuments();

    // Count resolved complaints
    const resolved = await Complaint.countDocuments({ status: "Resolved" });

    // Resolution rate as percentage
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // Number of active departments
    const departments = 24;

    sendSuccess(res, 200, "Stats fetched", { total, resolved, rate, departments });
  })
);

// Keep your existing routes below...
router.get("/", asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Complaints route active", { complaints: [] });
}));

router.post("/", asyncHandler(async (req, res) => {
  sendSuccess(res, 201, "Create complaint", {});
}));

router.get("/:id", asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Get complaint", { id: req.params.id });
}));

router.patch("/:id/status", asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Update status", {});
}));

module.exports = router;