/**
 * services/notificationService.js
 * API calls related to in-app notifications.
 */

import api from "./api";

export const notificationService = {
  getAll: (params) => api.get("/notifications", { params }),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/notifications/read-all"),
};
