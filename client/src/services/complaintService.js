/**
 * services/complaintService.js
 * API calls related to complaints.
 * This abstracts away the API details from the components.
 * Each function corresponds to a backend endpoint.
 * This keeps our components clean and focused on UI logic.
 * The actual API calls are made using the `api` instance from services/api.js,
 * which is pre-configured with the base URL and interceptors.
 * This file can be easily extended in the future as we add more complaint-related features.
 * For example, we could add functions for adding comments to complaints, or fetching complaint statistics.
 * This modular approach also makes it easier to mock API calls in tests.
 * We can simply mock the functions in this service without worrying about the underlying HTTP details.
 * Overall, this service layer is a crucial part of our frontend architecture, promoting separation of concerns and maintainability.
 * As we build out the complaint management features, this service will be the go-to place for all API interactions related to complaints.
 * It will help us keep our components clean and focused on rendering the UI and handling user interactions.
 * In the future, we might also add error handling logic here to standardize how we deal with API errors across the app.
 * For now, it provides a simple and consistent interface for our components to interact with the backend.
 */

import api from "./api";

export const complaintService = {
  getAll: (params) => api.get("/complaints", { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  create: (data) => api.post("/complaints", data),
  updateStatus: (id, status) => api.patch(`/complaints/${id}/status`, { status }),
};
