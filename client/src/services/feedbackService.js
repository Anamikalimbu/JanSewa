/**
 * services/feedbackService.js
 * API calls for citizen feedback left on resolved complaints.
 */
import api from "./api";

export const feedbackService = {
  submit: (complaintId, rating, message) =>
    api.post("/feedback", { complaintId, rating, message }),
  getForComplaint: (complaintId) => api.get(`/feedback/complaint/${complaintId}`),

  // Admin only
  getAll: (params) => api.get("/feedback", { params }),
  getStats: () => api.get("/feedback/stats"),
};
