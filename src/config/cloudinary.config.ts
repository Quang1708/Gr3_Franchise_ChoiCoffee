import { ENV } from "./env.config";

export const CLOUDINARY_CONFIG = {
  cloudName: ENV.CLOUDINARY_CLOUD_NAME,
  uploadPreset: ENV.CLOUDINARY_UPLOAD_PRESET,
};

// URL để upload ảnh lên Cloudinary
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
