/**
 * services/userService.js
 * API calls for user management — listing (admin), profile fetch/update,
 * and role changes.
 */

import api from "./api";

export const userService = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, fields) => api.patch(`/users/${id}`, fields),
  updateRole: (id, role, departmentId) => api.patch(`/users/${id}/role`, { role, departmentId }),
};
