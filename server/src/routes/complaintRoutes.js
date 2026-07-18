const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendPaginated } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const { protect, authorize } = require("../middleware/auth");
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");
const { COMPLAINT_STATUSES, NOTIFICATION_TYPES } = require("../constants");

const router = express.Router();

// A short, human-friendly reference shown in the UI (e.g. #CMP4F2A1B)
const toComplaintCode = (id) => `CMP${id.toString().slice(-6).toUpperCase()}`;

/**
 * GET /api/complaints/stats
 * Public — aggregate stats for the landing page.
 */
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const total = await Complaint.countDocuments();
    const closed = await Complaint.countDocuments({ status: COMPLAINT_STATUSES.CLOSED });
    const solved = await Complaint.countDocuments({ status: COMPLAINT_STATUSES.RESOLVED });
    const processing = await Complaint.countDocuments({ status: COMPLAINT_STATUSES.IN_PROGRESS });
    const unseen = await Complaint.countDocuments({ status: COMPLAINT_STATUSES.PENDING });
    const seen = await Complaint.countDocuments({ status: COMPLAINT_STATUSES.ASSIGNED });
    const departments = 24;

    sendSuccess(res, 200, "Stats fetched", {
      total, seen, processing, unseen, solved, closed, departments,
    });
  })
);

/**
 * GET /api/complaints/stats/me
 * Protected — the logged-in citizen's own complaint counts,
 * used by the Citizen Dashboard summary cards.
 */
router.get(
  "/stats/me",
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const [total, pending, inProgress, resolved] = await Promise.all([
      Complaint.countDocuments({ userId }),
      Complaint.countDocuments({ userId, status: COMPLAINT_STATUSES.PENDING }),
      Complaint.countDocuments({
        userId,
        status: { $in: [COMPLAINT_STATUSES.ASSIGNED, COMPLAINT_STATUSES.IN_PROGRESS] },
      }),
      Complaint.countDocuments({
        userId,
        status: { $in: [COMPLAINT_STATUSES.RESOLVED, COMPLAINT_STATUSES.CLOSED] },
      }),
    ]);

    sendSuccess(res, 200, "Your complaint stats", { total, pending, inProgress, resolved });
  })
);

/**
 * GET /api/complaints/mine?limit=5
 * Protected — the logged-in citizen's most recent complaints,
 * used by the "Recent Complaints" table on the dashboard.
 */
router.get(
  "/mine",
  protect,
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 5, 50);

    const complaints = await Complaint.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("departmentId", "departmentName");

    const data = complaints.map((c) => ({
      id: c._id,
      code: toComplaintCode(c._id),
      title: c.title,
      category: c.category,
      status: c.status,
      department: c.departmentId?.departmentName || null,
      createdAt: c.createdAt,
    }));

    sendSuccess(res, 200, "Your recent complaints", { complaints: data });
  })
);

/**
 * GET /api/complaints
 * Protected — citizens see only their own complaints;
 * department/admin roles see everything (with basic filters + pagination).
 */
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const { status, category } = req.query;

    const filter = {};
    if (req.user.role === "citizen") filter.userId = req.user._id;
    if (status) filter.status = status;
    if (category) filter.category = category;

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("departmentId", "departmentName"),
      Complaint.countDocuments(filter),
    ]);

    const data = complaints.map((c) => ({
      id: c._id,
      code: toComplaintCode(c._id),
      title: c.title,
      description: c.description,
      category: c.category,
      priority: c.priority,
      status: c.status,
      department: c.departmentId?.departmentName || null,
      createdAt: c.createdAt,
    }));

    sendPaginated(res, data, page, limit, total, "Complaints fetched");
  })
);

/**
 * POST /api/complaints
 * Protected — any authenticated user can file a complaint.
 */
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { title, description, category, priority, location, images } = req.body;

    if (!title || !description || !category) {
      throw new AppError("Title, description and category are required.", 400);
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority,
      location,
      images,
      userId: req.user._id,
    });

    sendSuccess(res, 201, "Complaint submitted successfully.", {
      complaint: { id: complaint._id, code: toComplaintCode(complaint._id), ...complaint.toObject() },
    });
  })
);

/**
 * GET /api/complaints/:id
 * Protected — citizens may only view their own complaint.
 */
router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const complaint = await Complaint.findById(req.params.id).populate(
      "departmentId",
      "departmentName"
    );

    if (!complaint) throw new AppError("Complaint not found.", 404);

    if (req.user.role === "citizen" && String(complaint.userId) !== String(req.user._id)) {
      throw new AppError("You do not have permission to view this complaint.", 403);
    }

    sendSuccess(res, 200, "Complaint fetched", {
      complaint: { code: toComplaintCode(complaint._id), ...complaint.toObject() },
    });
  })
);

/**
 * PATCH /api/complaints/:id/status
 * Protected — only department officers/admins can change status.
 * Also drops a notification for the citizen who filed it.
 */
router.patch(
  "/:id/status",
  protect,
  authorize("department", "admin"),
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const validStatuses = Object.values(COMPLAINT_STATUSES);

    if (!status || !validStatuses.includes(status)) {
      throw new AppError(`Status must be one of: ${validStatuses.join(", ")}`, 400);
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw new AppError("Complaint not found.", 404);

    complaint.status = status;
    if (status === COMPLAINT_STATUSES.RESOLVED) complaint.resolvedAt = new Date();
    if (status === COMPLAINT_STATUSES.ASSIGNED) complaint.assignedAt = new Date();
    await complaint.save();

    await Notification.create({
      userId: complaint.userId,
      message: `Your complaint "${complaint.title}" is now marked as ${status}.`,
      type: NOTIFICATION_TYPES.STATUS_UPDATED,
      complaintId: complaint._id,
    });

    sendSuccess(res, 200, "Complaint status updated.", { complaint });
  })
);

module.exports = router;
