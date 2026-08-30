/**
 * services/mapService.js
 * API calls for the Complaints Map — geo points + AI hotspot insights.
 */

import api from "./api";

export const mapService = {
  getPoints: (params) => api.get("/map/complaints", { params }),
  getInsights: () => api.get("/map/insights"),
};
