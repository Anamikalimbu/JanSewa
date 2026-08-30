/**
 * services/announcementService.js
 * API calls for public announcements + admin management.
 */
import api from "./api";

export const announcementService = {
  getAll: (params) => api.get("/announcements", { params }),
  getById: (id) => api.get(`/announcements/${id}`),
  getCategories: () => api.get("/announcements/meta/categories"),

  // Admin only
  create: (fields) => api.post("/announcements", fields),
  update: (id, fields) => api.patch(`/announcements/${id}`, fields),
  remove: (id) => api.delete(`/announcements/${id}`),
};
