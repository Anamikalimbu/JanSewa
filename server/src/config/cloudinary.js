/**
 * config/cloudinary.js
 *
 * Cloudinary SDK setup, merged in from the second backend build.
 * Used to store complaint images in the cloud instead of (or on top of)
 * local disk, so uploaded photos survive server restarts/redeploys.
 *
 * Cloudinary is OPTIONAL: if CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET are
 * not set in .env, isCloudinaryConfigured() returns false and the app
 * falls back to local disk storage (the original behaviour), so nothing
 * breaks for anyone who hasn't set up a Cloudinary account yet.
 */
const cloudinary = require("cloudinary").v2;

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Uploads a local file (already saved to disk by multer) to Cloudinary.
 * @param {string} filePath - local path of the file to upload
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<object>} Cloudinary upload result ({ secure_url, public_id, ... })
 */
const uploadToCloudinary = (filePath, folder = "jansewa/complaints") =>
  cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: "image",
    transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }],
  });

/**
 * Deletes a file from Cloudinary using its public_id.
 * @param {string} publicId
 */
const deleteFromCloudinary = (publicId) => {
  if (!publicId) return Promise.resolve(null);
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { cloudinary, isCloudinaryConfigured, uploadToCloudinary, deleteFromCloudinary };
