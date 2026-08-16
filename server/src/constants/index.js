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

// --- Admin email pattern ---
// Admin accounts are never created via public self-registration with an
// arbitrary email. To register or log in as an admin, the email must match
// this fixed, reserved pattern: admin.<identifier>@jansewa.gov.np
// (e.g. admin.anamika@jansewa.gov.np). This keeps the admin namespace
// separate from citizen/department emails and prevents anyone from just
// picking "Administrator" on the register form with any email.
const ADMIN_EMAIL_REGEX = /^admin\.[a-z0-9._-]{2,40}@jansewa\.gov\.np$/i;
const ADMIN_EMAIL_DOMAIN = "jansewa.gov.np";

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
  ADMIN_EMAIL_REGEX,
  ADMIN_EMAIL_DOMAIN,
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  COMPLAINT_STATUSES,
  NOTIFICATION_TYPES,
};
