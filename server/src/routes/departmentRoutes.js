const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const { protect, authorize } = require("../middleware/auth");
const Department = require("../models/Department");
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const { ROLES, COMPLAINT_STATUSES } = require("../constants");

const router = express.Router();

/**
 * GET /api/departments/public
 * No auth required — just id + name of active departments, for the
 * "Department Staff" dropdown on the registration form.
 * Must be declared before the admin-only guard below.
 */
router.get(
  "/public",
  asyncHandler(async (req, res) => {
    const departments = await Department.find({ isActive: true })
      .select("departmentName")
      .sort({ departmentName: 1 });
    sendSuccess(res, 200, "Departments fetched", { departments });
  })
);

/**
 * GET /api/departments/directory
 * Any logged-in user — read-only list of active departments (name,
 * description, contact, handled categories) with no admin-only stats.
 * Powers the Department role's "Departments" page so staff can see who
 * else exists on the platform.
 */
router.get(
  "/directory",
  protect,
  asyncHandler(async (req, res) => {
    const departments = await Department.find({ isActive: true })
      .select("departmentName description contactEmail categories")
      .sort({ departmentName: 1 });
    sendSuccess(res, 200, "Departments fetched", { departments });
  })
);

// Every route below this requires a logged-in admin
router.use(protect, authorize(ROLES.ADMIN));

// Attach live staff/assigned/resolved/pending counts to a department doc,
// used by the "Departments Overview" table on the admin dashboard.
const withStats = async (dept) => {
  const [staff, assigned, resolved] = await Promise.all([
    User.countDocuments({ role: ROLES.DEPARTMENT, departmentId: dept._id }),
    Complaint.countDocuments({ departmentId: dept._id }),
    Complaint.countDocuments({
      departmentId: dept._id,
      status: { $in: [COMPLAINT_STATUSES.RESOLVED, COMPLAINT_STATUSES.CLOSED] },
    }),
  ]);

  return {
    id: dept._id,
    departmentName: dept.departmentName,
    description: dept.description,
    contactEmail: dept.contactEmail,
    categories: dept.categories || [],
    isActive: dept.isActive,
    staff,
    assigned,
    resolved,
    pending: assigned - resolved,
  };
};

/**
 * GET /api/departments
 * Admin only — list of departments with live stats, for the
 * "Departments Overview" table.
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const departments = await Department.find().sort({ departmentName: 1 });
    const data = await Promise.all(departments.map(withStats));
    sendSuccess(res, 200, "Departments fetched", { departments: data });
  })
);

/**
 * POST /api/departments
 * Admin only — create a new department.
 */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { departmentName, description, contactEmail, categories } = req.body;
    if (!departmentName || !contactEmail) {
      throw new AppError("Department name and contact email are required.", 400);
    }

    const department = await Department.create({
      departmentName,
      description,
      contactEmail,
      categories: Array.isArray(categories) ? categories : [],
    });
    sendSuccess(res, 201, "Department created.", { department });
  })
);

/**
 * GET /api/departments/:id
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const department = await Department.findById(req.params.id);
    if (!department) throw new AppError("Department not found.", 404);
    sendSuccess(res, 200, "Department fetched", { department: await withStats(department) });
  })
);

/**
 * PATCH /api/departments/:id
 */
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const department = await Department.findById(req.params.id);
    if (!department) throw new AppError("Department not found.", 404);

    const { departmentName, description, contactEmail, categories, isActive } = req.body;
    if (departmentName !== undefined) department.departmentName = departmentName;
    if (description !== undefined) department.description = description;
    if (contactEmail !== undefined) department.contactEmail = contactEmail;
    if (categories !== undefined) department.categories = Array.isArray(categories) ? categories : [];
    if (isActive !== undefined) department.isActive = isActive;

    await department.save();
    sendSuccess(res, 200, "Department updated.", { department });
  })
);

module.exports = router;
