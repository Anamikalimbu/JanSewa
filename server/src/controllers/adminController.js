import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Complaint from "../models/Complaint.js";
import Department from "../models/Department.js";
import { ApiError, sendSuccess } from "../utils/sendResponse.js";

/**
 * @desc    Get high-level dashboard summary counts
 * @route   GET /api/v1/admin/dashboard/summary
 * @access  Private/Admin
 */
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const [totalUsers, totalCitizens, totalOfficers, totalComplaints, totalDepartments] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: "citizen", isActive: true }),
    User.countDocuments({ role: "officer", isActive: true }),
    Complaint.countDocuments({ isDeleted: false }),
    Department.countDocuments({ isActive: true }),
  ]);

  const [pending, underReview, inProgress, resolved, rejected] = await Promise.all([
    Complaint.countDocuments({ isDeleted: false, status: "Pending" }),
    Complaint.countDocuments({ isDeleted: false, status: "Under Review" }),
    Complaint.countDocuments({ isDeleted: false, status: "In Progress" }),
    Complaint.countDocuments({ isDeleted: false, status: "Resolved" }),
    Complaint.countDocuments({ isDeleted: false, status: "Rejected" }),
  ]);

  sendSuccess(res, 200, "Dashboard summary fetched successfully", {
    data: {
      totalUsers,
      totalCitizens,
      totalOfficers,
      totalComplaints,
      totalDepartments,
      statusBreakdown: { pending, underReview, inProgress, resolved, rejected },
    },
  });
});

/**
 * @desc    Get complaint analytics (status distribution, priority distribution,
 *          average resolution time)
 * @route   GET /api/v1/admin/dashboard/analytics
 * @access  Private/Admin
 */
export const getComplaintAnalytics = asyncHandler(async (req, res) => {
  const statusDistribution = await Complaint.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { status: "$_id", count: 1, _id: 0 } },
  ]);

  const priorityDistribution = await Complaint.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: "$priority", count: { $sum: 1 } } },
    { $project: { priority: "$_id", count: 1, _id: 0 } },
  ]);

  const avgResolutionTimeResult = await Complaint.aggregate([
    { $match: { isDeleted: false, status: "Resolved", resolvedAt: { $ne: null } } },
    {
      $project: {
        resolutionTimeHours: {
          $divide: [{ $subtract: ["$resolvedAt", "$createdAt"] }, 1000 * 60 * 60],
        },
      },
    },
    { $group: { _id: null, avgHours: { $avg: "$resolutionTimeHours" } } },
  ]);

  const avgResolutionTimeHours = avgResolutionTimeResult[0]?.avgHours || 0;

  sendSuccess(res, 200, "Complaint analytics fetched successfully", {
    data: {
      statusDistribution,
      priorityDistribution,
      avgResolutionTimeHours: Number(avgResolutionTimeHours.toFixed(2)),
    },
  });
});

/**
 * @desc    Get monthly complaint report (count per month for current or given year)
 * @route   GET /api/v1/admin/dashboard/monthly-report?year=2025
 * @access  Private/Admin
 */
export const getMonthlyReport = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  const monthlyData = await Complaint.aggregate([
    {
      $match: {
        isDeleted: false,
        createdAt: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        totalComplaints: { $sum: 1 },
        resolved: {
          $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
        },
        rejected: {
          $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] },
        },
        pending: {
          $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
        },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  // Fill in months with zero data for a complete 12-month report
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const fullReport = monthNames.map((name, index) => {
    const found = monthlyData.find((m) => m._id.month === index + 1);
    return {
      month: name,
      totalComplaints: found?.totalComplaints || 0,
      resolved: found?.resolved || 0,
      rejected: found?.rejected || 0,
      pending: found?.pending || 0,
    };
  });

  sendSuccess(res, 200, "Monthly report fetched successfully", {
    data: { year, report: fullReport },
  });
});

/**
 * @desc    Get complaint statistics grouped by category
 * @route   GET /api/v1/admin/dashboard/category-stats
 * @access  Private/Admin
 */
export const getCategoryStats = asyncHandler(async (req, res) => {
  const categoryStats = await Complaint.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$category",
        totalComplaints: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
      },
    },
    { $project: { category: "$_id", totalComplaints: 1, resolved: 1, pending: 1, _id: 0 } },
    { $sort: { totalComplaints: -1 } },
  ]);

  sendSuccess(res, 200, "Category statistics fetched successfully", { data: { categoryStats } });
});

/**
 * @desc    Get complaint statistics grouped by department
 * @route   GET /api/v1/admin/dashboard/department-stats
 * @access  Private/Admin
 */
export const getDepartmentStats = asyncHandler(async (req, res) => {
  const departmentStats = await Complaint.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$department",
        totalComplaints: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
      },
    },
    {
      $lookup: {
        from: "departments",
        localField: "_id",
        foreignField: "_id",
        as: "departmentInfo",
      },
    },
    { $unwind: "$departmentInfo" },
    {
      $project: {
        _id: 0,
        departmentId: "$_id",
        departmentName: "$departmentInfo.name",
        departmentCode: "$departmentInfo.code",
        totalComplaints: 1,
        resolved: 1,
        inProgress: 1,
        pending: 1,
      },
    },
    { $sort: { totalComplaints: -1 } },
  ]);

  sendSuccess(res, 200, "Department statistics fetched successfully", { data: { departmentStats } });
});

/**
 * @desc    Create a new department
 * @route   POST /api/v1/admin/departments
 * @access  Private/Admin
 */
export const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, description, categories, headOfficer } = req.body;

  const existing = await Department.findOne({ $or: [{ name }, { code }] });
  if (existing) {
    throw new ApiError(409, "A department with this name or code already exists");
  }

  const department = await Department.create({ name, code, description, categories, headOfficer });

  sendSuccess(res, 201, "Department created successfully", { data: { department } });
});

/**
 * @desc    Get all departments
 * @route   GET /api/v1/admin/departments
 * @access  Private
 */
export const getAllDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true }).populate("headOfficer", "name email");
  sendSuccess(res, 200, "Departments fetched successfully", { data: { departments } });
});

/**
 * @desc    Update a department
 * @route   PATCH /api/v1/admin/departments/:id
 * @access  Private/Admin
 */
export const updateDepartment = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "code", "description", "categories", "headOfficer", "isActive"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const department = await Department.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  sendSuccess(res, 200, "Department updated successfully", { data: { department } });
});

/**
 * @desc    Delete (deactivate) a department
 * @route   DELETE /api/v1/admin/departments/:id
 * @access  Private/Admin
 */
export const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  sendSuccess(res, 200, "Department deactivated successfully");
});
