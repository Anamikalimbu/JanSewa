/**
 * services/complaintService.js
 * API calls related to complaints — keeps components clean and focused
 * on UI logic while this file owns the actual HTTP details.
 */

import api from "./api";

export const complaintService = {
  getCategories: () => api.get("/complaints/meta/categories"),
  getStats: () => api.get("/complaints/stats"),
  getMyStats: () => api.get("/complaints/stats/me"),
  getDepartmentStats: () => api.get("/complaints/stats/department"),
  getDepartmentTrend: (months) => api.get("/complaints/stats/department/over-time", { params: { months } }),
  getMine: (params) => api.get("/complaints/mine", { params }),
  getPublic: (params) => api.get("/complaints/public", { params }),

  // params: { page, limit, tab, search, sort }
  getAll: (params) => api.get("/complaints", { params }),

  getById: (id) => api.get(`/complaints/${id}`),

  // Builds multipart/form-data so image files can ride along with the
  // rest of the complaint fields in one request.
  create: (fields, files = []) => {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      formData.append(key, typeof value === "object" ? JSON.stringify(value) : value);
    });
    files.forEach((file) => formData.append("images", file));

    return api.post("/complaints", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  addComment: (id, message) => api.post(`/complaints/${id}/comments`, { message }),
  reportIssue: (id, reason) => api.post(`/complaints/${id}/report`, { reason }),
  updateStatus: (id, status, note) => api.patch(`/complaints/${id}/status`, { status, note }),
  assignDepartment: (id, departmentId) => api.patch(`/complaints/${id}/assign-department`, { departmentId }),
  delete: (id) => api.delete(`/complaints/${id}`),
};
