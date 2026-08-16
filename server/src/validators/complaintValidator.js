import { body, param } from "express-validator";

export const createComplaintValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 150 })
    .withMessage("Title must be between 5 and 150 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("department").trim().isMongoId().withMessage("A valid department ID is required"),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High", "Critical"])
    .withMessage("Invalid priority value"),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("latitude").optional().isFloat({ min: -90, max: 90 }).withMessage("Invalid latitude"),
  body("longitude").optional().isFloat({ min: -180, max: 180 }).withMessage("Invalid longitude"),
];

export const updateComplaintValidator = [
  param("id").isMongoId().withMessage("Invalid complaint ID"),
  body("title").optional().trim().isLength({ min: 5, max: 150 }).withMessage("Title must be between 5 and 150 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High", "Critical"])
    .withMessage("Invalid priority value"),
];

export const updateStatusValidator = [
  param("id").isMongoId().withMessage("Invalid complaint ID"),
  body("status")
    .isIn(["Pending", "Under Review", "In Progress", "Resolved", "Rejected"])
    .withMessage("Invalid status value"),
  body("remarks").optional().trim().isLength({ max: 1000 }).withMessage("Remarks cannot exceed 1000 characters"),
];

export const assignOfficerValidator = [
  param("id").isMongoId().withMessage("Invalid complaint ID"),
  body("officerId").isMongoId().withMessage("A valid officer ID is required"),
];

export const mongoIdParamValidator = [param("id").isMongoId().withMessage("Invalid ID format")];
