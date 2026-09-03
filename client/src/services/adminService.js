/**
 * services/adminService.js
 * API calls powering the Admin Dashboard's summary cards and charts.
 */

import api from "./api";

export const adminService = {
  getStats: () => api.get("/admin/stats"),
  getCategoryAnalytics: () => api.get("/admin/category-analytics"),
  getComplaintsOverTime: (months = 6) => api.get("/admin/complaints-over-time", { params: { months } }),
  getStatusBreakdown: () => api.get("/admin/status-breakdown"),
  getPendingUsers: () => api.get("/admin/pending-users"),
  approveUser: (id) => api.patch(`/admin/pending-users/${id}/approve`),
  rejectUser: (id, reason) => api.patch(`/admin/pending-users/${id}/reject`, { reason }),
};
