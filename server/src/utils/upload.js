const fs = require("fs");
const path = require("path");
const multer = require("multer");
const AppError = require("./AppError");

/**
 * utils/upload.js
 *
 * Multer setup for the "Upload Images" field on the Submit Complaint form.
 * Files are stored on local disk under server/uploads/complaints and
 * served statically at /uploads/complaints/<filename> (see app.js).
 *
 * Matches the wireframe's constraints: JPG/PNG/WEBP, max 5MB each, max 5 files.
 */
const uploadDir = path.join(__dirname, "..", "uploads", "complaints");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new AppError("Only JPG, PNG, and WEBP images are allowed.", 400));
  }
  cb(null, true);
};

const uploadComplaintImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5,
  },
});

module.exports = { uploadComplaintImages };
