import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

/**
 * Configure Cloudinary SDK using credentials from environment variables.
 * Used for storing complaint images and profile pictures.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a local file (from multer disk storage) to Cloudinary.
 * @param {string} filePath - Local path of the file to upload
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<object>} Cloudinary upload result
 */
export const uploadToCloudinary = async (filePath, folder = "jansewa/complaints") => {
  return cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: "image",
    transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }],
  });
};

/**
 * Deletes a file from Cloudinary using its public_id.
 * @param {string} publicId
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
