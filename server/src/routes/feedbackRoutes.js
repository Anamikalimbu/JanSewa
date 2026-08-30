const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendPaginated } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const { protect, authorize } = require("../middleware/auth");
const Feedback = require("../models/Feedback");
const Complaint = require("../models/Complaint");
const { ROLES, COMPLAINT_STATUSES } = require("../constants");

const router = express.Router();

/**
 * GET /api/feedback/stats
 * Admin only — average rating + total count, for the Admin Feedback page
 * summary cards. Registered before "/:complaintId" so it isn't shadowed.
 */
router.get(
  "/stats",
  protect,
  authorize(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const [agg] = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: "$rating" }, total: { $sum: 1 } } },
    ]);

    const distribution = await Feedback.aggregate([
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    sendSuccess(res, 200, "Feedback stats fetched", {
      avgRating: agg ? Math.round(agg.avgRating * 10) / 10 : 0,
      total: agg ? agg.total : 0,
      distribution: [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: distribution.find((d) => d._id === star)?.count || 0,
      })),
    });
  })
);

/**
 * GET /api/feedback
 * Admin only — paginated list of all citizen feedback, most recent first.
 */
router.get(
  "/",
  protect,
  authorize(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 100);

    const [feedback, total] = await Promise.all([
      Feedback.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "name email")
        .populate("complaintId", "title category"),
      Feedback.countDocuments(),
    ]);

    sendPaginated(res, feedback, page, limit, total, "Feedback fetched");
  })
);

/**
 * GET /api/feedback/complaint/:complaintId
 * Protected — fetch the feedback (if any) already left on a complaint.
 * Used by the complaint detail page to show existing feedback instead of
 * the submission form.
 */
router.get(
  "/complaint/:complaintId",
  protect,
  asyncHandler(async (req, res) => {
    const feedback = await Feedback.findOne({ complaintId: req.params.complaintId });
    sendSuccess(res, 200, "Feedback fetched", { feedback });
  })
);

/**
 * POST /api/feedback
 * Citizen only — leave a rating + optional comment on their own complaint,
 * once it has reached Resolved or Closed. One feedback per complaint.
 */
router.post(
  "/",
  protect,
  authorize(ROLES.CITIZEN),
  asyncHandler(async (req, res) => {
    const { complaintId, rating, message } = req.body;

    if (!complaintId || !rating) {
      throw new AppError("A complaint and rating are required.", 400);
    }
    if (rating < 1 || rating > 5) {
      throw new AppError("Rating must be between 1 and 5.", 400);
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) throw new AppError("Complaint not found.", 404);

    if (String(complaint.userId) !== String(req.user._id)) {
      throw new AppError("You can only leave feedback on your own complaints.", 403);
    }
    if (![COMPLAINT_STATUSES.RESOLVED, COMPLAINT_STATUSES.CLOSED].includes(complaint.status)) {
      throw new AppError("Feedback can only be left once a complaint is resolved.", 400);
    }

    const existing = await Feedback.findOne({ complaintId });
    if (existing) throw new AppError("You've already left feedback for this complaint.", 409);

    const feedback = await Feedback.create({
      complaintId,
      userId: req.user._id,
      rating,
      message: (message || "").trim(),
    });

    sendSuccess(res, 201, "Thank you for your feedback!", { feedback });
  })
);

module.exports = router;
