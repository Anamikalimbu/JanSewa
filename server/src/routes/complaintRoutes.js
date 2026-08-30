const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendPaginated } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const { protect, authorize } = require("../middleware/auth");
const { uploadComplaintImages } = require("../utils/upload");
const { isCloudinaryConfigured, uploadToCloudinary } = require("../config/cloudinary");
const fs = require("fs");
const Complaint = require("../models/Complaint");
const Department = require("../models/Department");
const Notification = require("../models/Notification");
const CATEGORY_META = require("../constants/categoryMeta");
const { COMPLAINT_STATUSES, NOTIFICATION_TYPES } = require("../constants");

const router = express.Router();

// A short, human-friendly reference shown in the UI (e.g. #CMP4F2A1B)
const toComplaintCode = (id) => `CMP${id.toString().slice(-6).toUpperCase()}`;

// Shared shape for a complaint returned in list views
const toListItem = (c) => ({
  id: c._id,
  code: toComplaintCode(c._id),
  title: c.title,
  description: c.description,
  category: c.category,
  subCategory: c.subCategory,
  priority: c.priority,
  status: c.status,
  wardNumber: c.wardNumber,
  location: c.location,
  images: c.images,
  department: c.departmentId?.departmentName || null,
  departmentId: c.departmentId?._id || null,
  assignedOfficer: c.assignedOfficer,
  createdAt: c.createdAt,
});

/**
 * GET /api/complaints/meta/categories
 * Bilingual category/sub-category options for the Submit Complaint form.
 */
router.get(
  "/meta/categories",
  asyncHandler(async (req, res) => {
    sendSuccess(res, 200, "Categories fetched", { categories: CATEGORY_META });
  })
);

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
 * Protected — the logged-in citizen's own complaint counts. Powers both
 * the dashboard summary cards AND the "My Complaints" filter tab counts.
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
 * GET /api/complaints/stats/department
 * Protected — department-role only. Counts scoped to the logged-in
 * staff member's own department, powering the Department Dashboard's
 * summary cards.
 */
router.get(
  "/stats/department",
  protect,
  authorize("department"),
  asyncHandler(async (req, res) => {
        // req.user.departmentId comes back populated (a full Department
    // document) from the protect middleware, not a raw ObjectId — pull
    // out just the id so Mongo comparisons/aggregation match correctly.
    const departmentId = req.user.departmentId?._id || null;

    if (!departmentId) {
      // Staff account not yet linked to a department — nothing to show.
      return sendSuccess(res, 200, "Your department stats", {
        assigned: 0, pending: 0, inProgress: 0, resolved: 0,
      });
    }

    const [assigned, pending, inProgress, resolved] = await Promise.all([
      Complaint.countDocuments({ departmentId }),
      Complaint.countDocuments({ departmentId, status: COMPLAINT_STATUSES.PENDING }),
      Complaint.countDocuments({
        departmentId,
        status: { $in: [COMPLAINT_STATUSES.ASSIGNED, COMPLAINT_STATUSES.IN_PROGRESS] },
      }),
      Complaint.countDocuments({
        departmentId,
        status: { $in: [COMPLAINT_STATUSES.RESOLVED, COMPLAINT_STATUSES.CLOSED] },
      }),
    ]);

    sendSuccess(res, 200, "Your department stats", { assigned, pending, inProgress, resolved });
  })
);

/**
 * GET /api/complaints/stats/department/over-time?months=6
 * Protected — department-role only. Monthly complaint counts scoped to
 * the logged-in staff member's department, for the Reports page chart.
 */
router.get(
  "/stats/department/over-time",
  protect,
  authorize("department"),
  asyncHandler(async (req, res) => {
    const departmentId = req.user.departmentId?._id || null;
    const months = Math.min(Math.max(Number(req.query.months) || 6, 1), 24);

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const grouped = departmentId
      ? await Complaint.aggregate([
          { $match: { departmentId, createdAt: { $gte: start } } },
          {
            $group: {
              _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
              count: { $sum: 1 },
            },
          },
        ])
      : [];
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

    sendSuccess(res, 200, "Department complaints over time fetched", { series });
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

    sendSuccess(res, 200, "Your recent complaints", { complaints: complaints.map(toListItem) });
  })
);

/**
 * GET /api/complaints
 * Protected — powers the "My Complaints" page: search, status-tab filter,
 * sort, and pagination. Citizens only ever see their own complaints;
 * department/admin roles see everything.
 *
 * Query params:
 *  - page, limit
 *  - tab: all | pending | inProgress | resolved  (maps to one or more statuses)
 *  - search: matches title, category, or the #CMP code
 *  - sort: -createdAt (default) | createdAt
 */
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 5, 100);
    const { tab, search, sort } = req.query;

    const filter = {};
    if (req.user.role === "citizen") filter.userId = req.user._id;
    if (req.user.role === "department") filter.departmentId = req.user.departmentId?._id || null;

    const TAB_STATUS_MAP = {
      pending: [COMPLAINT_STATUSES.PENDING],
      inProgress: [COMPLAINT_STATUSES.ASSIGNED, COMPLAINT_STATUSES.IN_PROGRESS],
      resolved: [COMPLAINT_STATUSES.RESOLVED, COMPLAINT_STATUSES.CLOSED],
    };
    if (tab && TAB_STATUS_MAP[tab]) filter.status = { $in: TAB_STATUS_MAP[tab] };

    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const orClauses = [{ title: rx }, { category: rx }];
      // Allow searching by the short #CMP code too (last 6 hex chars of the _id)
      const codeMatch = search.trim().match(/^#?CMP([0-9A-Fa-f]{1,6})$/i);
      if (codeMatch) {
        orClauses.push({ $expr: { $regexMatch: { input: { $toString: "$_id" }, regex: codeMatch[1], options: "i" } } });
      }
      filter.$or = orClauses;
    }

    const sortSpec = sort === "createdAt" ? { createdAt: 1 } : { createdAt: -1 };

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort(sortSpec)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("departmentId", "departmentName"),
      Complaint.countDocuments(filter),
    ]);

    sendPaginated(res, complaints.map(toListItem), page, limit, total, "Complaints fetched");
  })
);

/**
 * POST /api/complaints
 * Protected — files a new complaint. Accepts multipart/form-data so up to
 * 5 images (JPG/PNG/WEBP, ≤5MB each) can be attached alongside the fields.
 */
router.post(
  "/",
  protect,
  uploadComplaintImages.array("images", 5),
  asyncHandler(async (req, res) => {
    const { title, description, category, subCategory, priority, wardNumber } = req.body;
    // location may arrive as a JSON string (multipart) or a plain string address
    let location = req.body.location;
    if (typeof location === "string") {
      try {
        location = JSON.parse(location);
      } catch {
        location = { address: location };
      }
    }

    if (!title || !description || !category || !location?.address) {
      throw new AppError("Title, description, category and location are required.", 400);
    }

    // If Cloudinary credentials are configured, push each uploaded file to
    // Cloudinary and store the returned secure URL instead of a local path
    // (so images survive restarts/redeploys). Otherwise fall back to the
    // original local-disk URL, exactly as before.
    let images;
    if (isCloudinaryConfigured() && req.files?.length) {
      images = await Promise.all(
        req.files.map(async (f) => {
          const result = await uploadToCloudinary(f.path);
          fs.unlink(f.path, () => {}); // clean up the local temp copy
          return result.secure_url;
        })
      );
    } else {
      images = (req.files || []).map((f) => `/uploads/complaints/${f.filename}`);
    }

    // Auto-route to whichever active department handles this category, so
    // it shows up in that department's queue immediately. If no department
    // is configured for the category yet, it's simply left unassigned —
    // an admin can wire that up any time from Admin > Departments.
    const matchedDepartment = await Department.findOne({ isActive: true, categories: category });

    const complaint = await Complaint.create({
      title,
      description,
      category,
      subCategory,
      priority,
      wardNumber,
      location,
      images,
      userId: req.user._id,
      departmentId: matchedDepartment?._id || null,
      statusHistory: [{ status: COMPLAINT_STATUSES.PENDING, note: "Complaint submitted." }],
    });

    await Notification.create({
      userId: req.user._id,
      message: `Your complaint "${complaint.title}" has been submitted and is pending review.`,
      type: NOTIFICATION_TYPES.COMPLAINT_CREATED,
      complaintId: complaint._id,
    });

    sendSuccess(res, 201, "Complaint submitted successfully.", {
      complaint: toListItem(complaint),
    });
  })
);

/**
 * GET /api/complaints/:id
 * Protected — full complaint detail, including status timeline & comments.
 * Citizens may only view their own complaint.
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
      complaint: {
        ...toListItem(complaint),
        statusHistory: complaint.statusHistory,
        comments: complaint.comments,
      },
    });
  })
);

/**
 * POST /api/complaints/:id/comments
 * Protected — add a comment to a complaint (owner, department, or admin).
 */
router.post(
  "/:id/comments",
  protect,
  asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message || !message.trim()) throw new AppError("Comment message is required.", 400);

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw new AppError("Complaint not found.", 404);

    if (req.user.role === "citizen" && String(complaint.userId) !== String(req.user._id)) {
      throw new AppError("You do not have permission to comment on this complaint.", 403);
    }

    complaint.comments.push({
      authorId: req.user._id,
      authorName: req.user.name,
      message: message.trim(),
    });
    await complaint.save();

    sendSuccess(res, 201, "Comment added.", { comments: complaint.comments });
  })
);

/**
 * POST /api/complaints/:id/report
 * Protected — lets the citizen who filed a complaint flag it for admin
 * attention (e.g. "no action taken in 2 weeks"), separate from the normal
 * status flow.
 */
router.post(
  "/:id/report",
  protect,
  asyncHandler(async (req, res) => {
    const { reason } = req.body;
    if (!reason || !reason.trim()) throw new AppError("A reason is required to report an issue.", 400);

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw new AppError("Complaint not found.", 404);

    if (req.user.role === "citizen" && String(complaint.userId) !== String(req.user._id)) {
      throw new AppError("You do not have permission to report this complaint.", 403);
    }

    complaint.reports.push({ userId: req.user._id, reason: reason.trim() });
    await complaint.save();

    sendSuccess(res, 200, "Thanks — this has been flagged for review by an administrator.");
  })
);

/**
 * PATCH /api/complaints/:id/status
 * Protected — only department officers/admins can change status.
 * Appends to the status timeline and notifies the citizen.
 */
router.patch(
  "/:id/status",
  protect,
  authorize("department", "admin"),
  asyncHandler(async (req, res) => {
    const { status, note } = req.body;
    const validStatuses = Object.values(COMPLAINT_STATUSES);

    if (!status || !validStatuses.includes(status)) {
      throw new AppError(`Status must be one of: ${validStatuses.join(", ")}`, 400);
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw new AppError("Complaint not found.", 404);

    complaint.status = status;
    if (status === COMPLAINT_STATUSES.RESOLVED) complaint.resolvedAt = new Date();
    if (status === COMPLAINT_STATUSES.ASSIGNED) complaint.assignedAt = new Date();
    complaint.statusHistory.push({ status, note: note || "" });
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

/**
 * PATCH /api/complaints/:id/assign-department
 * Admin only — (re)assigns which department a complaint belongs to.
 * Needed because auto-routing at submission time only works when a
 * department has been configured to handle that category — this lets
 * an admin fix unassigned or mis-routed complaints by hand.
 */
router.patch(
  "/:id/assign-department",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const { departmentId } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw new AppError("Complaint not found.", 404);

    if (departmentId) {
      const department = await Department.findById(departmentId);
      if (!department) throw new AppError("Department not found.", 404);
      complaint.departmentId = department._id;
      // A complaint that was just routed to a department, but hasn't had
      // its status explicitly progressed yet, moves out of the raw
      // "Pending" bucket so it shows up in that department's active queue.
      if (complaint.status === COMPLAINT_STATUSES.PENDING) {
        complaint.status = COMPLAINT_STATUSES.ASSIGNED;
        complaint.assignedAt = new Date();
        complaint.statusHistory.push({
          status: COMPLAINT_STATUSES.ASSIGNED,
          note: `Assigned to ${department.departmentName} by an administrator.`,
        });
      }
    } else {
      complaint.departmentId = null;
    }

    await complaint.save();
    const populated = await complaint.populate("departmentId", "departmentName");

    sendSuccess(res, 200, "Department assignment updated.", {
      complaint: { ...toListItem(populated) },
    });
  })
);

module.exports = router;
