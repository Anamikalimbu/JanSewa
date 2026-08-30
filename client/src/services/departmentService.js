/**
 * services/departmentService.js
 * API calls for department management — used by the admin
 * "Departments Overview" table and the Departments management page.
 */

import api from "./api";

export const departmentService = {
  // Public — no auth required. Used by the registration form's
  // "Department Staff" dropdown.
  getPublic: () => api.get("/departments/public"),
  getDirectory: () => api.get("/departments/directory"),
  getAll: () => api.get("/departments"),
  getById: (id) => api.get(`/departments/${id}`),
  create: (fields) => api.post("/departments", fields),
  update: (id, fields) => api.patch(`/departments/${id}`, fields),
};
