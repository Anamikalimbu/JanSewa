/**
 * constants/complaintStatus.js
 * Mirrors server/src/constants/index.js COMPLAINT_STATUSES — kept here so
 * status dropdowns (Department Dashboard, Admin Complaints) don't have to
 * guess at valid values.
 */
export const COMPLAINT_STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Assigned", label: "Assigned" },
  { value: "InProgress", label: "In Progress" },
  { value: "Resolved", label: "Resolved" },
  { value: "Closed", label: "Closed" },
];
