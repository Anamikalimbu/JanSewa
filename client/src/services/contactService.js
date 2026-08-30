/**
 * services/contactService.js
 * API calls for the public Contact page and admin message review.
 */
import api from "./api";

export const contactService = {
  send: (fields) => api.post("/contact", fields),

  // Admin only
  getAll: (params) => api.get("/contact", { params }),
  markStatus: (id, status) => api.patch(`/contact/${id}/status`, { status }),
};
