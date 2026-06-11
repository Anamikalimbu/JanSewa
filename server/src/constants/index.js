/**
 * constants/index.js
 * Central place for all enum values used across models, controllers, and services.
 * Keeping enums here avoids magic strings scattered throughout the codebase.
 */

const ROLES = Object.freeze({
  CITIZEN: "citizen",
  DEPARTMENT: "department",
  ADMIN: "admin",
});

const COMPLAINT_CATEGORIES = Object.freeze({
  ROAD: "Road",
  WATER: "Water",
  ELECTRICITY: "Electricity",
  GARBAGE: "Garbage",
  DRAINAGE: "Drainage",
  STREET_LIGHT: "StreetLight",
  OTHER: "Other",
});

const COMPLAINT_PRIORITIES = Object.freeze({
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
});

const COMPLAINT_STATUSES = Object.freeze({
  PENDING: "Pending",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "InProgress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
});

const NOTIFICATION_TYPES = Object.freeze({
  COMPLAINT_CREATED: "ComplaintCreated",
  COMPLAINT_ASSIGNED: "ComplaintAssigned",
  STATUS_UPDATED: "StatusUpdated",
  COMPLAINT_RESOLVED: "ComplaintResolved",
});

module.exports = {
  ROLES,
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  COMPLAINT_STATUSES,
  NOTIFICATION_TYPES,
};
