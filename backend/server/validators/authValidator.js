import { body } from "express-validator";

export const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters"),
  body("email").trim().isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("phone")
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Please provide a valid 10-digit phone number"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
  body("role")
    .optional()
    .isIn(["citizen", "officer", "admin"])
    .withMessage("Invalid role specified"),
];

export const loginValidator = [
  body("email").trim().isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const forgotPasswordValidator = [
  body("email").trim().isEmail().withMessage("Please provide a valid email").normalizeEmail(),
];

export const resetPasswordValidator = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
];

export const changePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/\d/)
    .withMessage("New password must contain at least one number"),
];

export const updateProfileValidator = [
  body("name").optional().trim().isLength({ min: 3, max: 50 }).withMessage("Name must be between 3 and 50 characters"),
  body("phone")
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Please provide a valid 10-digit phone number"),
  body("address").optional().trim().isLength({ max: 200 }).withMessage("Address cannot exceed 200 characters"),
];
