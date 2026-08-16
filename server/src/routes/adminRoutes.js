const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { protect, authorize } = require("../middleware/auth");
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const { ROLES, COMPLAINT_STATUSES, COMPLAINT_CATEGORIES } = require("../constants");

const router = express.Router();

// Every route here requires a logged-in admin
router.use(protect, authorize(ROLES.ADMIN));

/**
 * GET /api/admin/stats
 * The 4 top summary cards on the Admin Dashboard.
 */
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const [totalUsers, totalComplaints, resolved, pending] = await Promise.all([
      User.countDocuments(),
      Complaint.countDocuments(),
      Complaint.countDocuments({
        status: { $in: [COMPLAINT_STATUSES.RESOLVED, COMPLAINT_STATUSES.CLOSED] },
      }),
      Complaint.countDocuments({ status: COMPLAINT_STATUSES.PENDING }),
    ]);

    sendSuccess(res, 200, "Admin stats fetched", { totalUsers, totalComplaints, resolved, pending });
  })
);

/**
 * GET /api/admin/category-analytics
 * Complaint count + percentage share per category, for the donut chart.
 */
router.get(
  "/category-analytics",
  asyncHandler(async (req, res) => {
    const total = await Complaint.countDocuments();

    const grouped = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const countByCategory = Object.fromEntries(grouped.map((g) => [g._id, g.count]));

    // Always return every known category (even with 0 complaints) so the
    // legend/chart on the frontend has a stable, complete shape.
    const categories = Object.values(COMPLAINT_CATEGORIES).map((category) => {
      const count = countByCategory[category] || 0;
      return {
        category,
        count,
        percentage: total ? Math.round((count / total) * 100) : 0,
      };
    });

    sendSuccess(res, 200, "Category analytics fetched", { total, categories });
  })
);

/**
 * GET /api/admin/complaints-over-time?months=6
 * Complaint counts per calendar month, for the bar chart.
 */
router.get(
  "/complaints-over-time",
  asyncHandler(async (req, res) => {
    const months = Math.min(Math.max(Number(req.query.months) || 6, 1), 24);

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const grouped = await Complaint.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]);
    const countByKey = Object.fromEntries(
      grouped.map((g) => [`${g._id.year}-${g._id.month}`, g.count])
    );

    const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const series = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      series.push({ month: MONTH_LABELS[d.getMonth()], count: countByKey[key] || 0 });
    }

    sendSuccess(res, 200, "Complaints over time fetched", { series });
  })
);

/**
 * GET /api/admin/status-breakdown
 * Complaint count per lifecycle status, for the Analytics page's
 * pipeline chart (how many are stuck at each stage).
 */
router.get(
  "/status-breakdown",
  asyncHandler(async (req, res) => {
    const statuses = Object.values(COMPLAINT_STATUSES);
    const grouped = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const countByStatus = Object.fromEntries(grouped.map((g) => [g._id, g.count]));
    const breakdown = statuses.map((status) => ({ status, count: countByStatus[status] || 0 }));

    sendSuccess(res, 200, "Status breakdown fetched", { breakdown });
  })
);

module.exports = router;
