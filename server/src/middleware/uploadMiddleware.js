import multer from "multer";
import path from "path";
import fs from "fs";
import { ApiError } from "../utils/sendResponse.js";

// Ensure the local uploads directory exists (temp storage before Cloudinary push)
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Disk storage configuration - files are temporarily stored, then uploaded to Cloudinary
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only .jpeg, .jpg, .png and .webp image formats are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
  },
});

// For complaint creation - up to 5 images
export const uploadComplaintImages = upload.array("images", 5);

// For profile avatar - single image
export const uploadAvatar = upload.single("avatar");

export default upload;
