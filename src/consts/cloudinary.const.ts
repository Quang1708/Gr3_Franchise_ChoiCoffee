import type { TransformationOptions } from "@/models/cloudinary.model";

/**
 * Các transformation thông dụng với optimization
 */
export const CLOUDINARY_TRANSFORMATIONS = {
  // Thumbnail - tối ưu cho danh sách
  thumbnail: "w_150,h_150,c_thumb,g_face,q_auto,f_auto",

  // Sizes với auto quality và format
  small: "w_400,h_400,c_limit,q_auto,f_auto",
  medium: "w_800,h_800,c_limit,q_auto,f_auto",
  large: "w_1200,h_1200,c_limit,q_auto,f_auto",

  // Avatar - bo tròn với optimization
  avatar: "w_200,h_200,c_fill,g_face,r_max,q_auto,f_auto",

  // Banner với optimization
  banner: "w_1920,h_400,c_fill,q_auto,f_auto",

  // Responsive - cho mobile
  mobile: "w_600,c_limit,q_auto:good,f_auto",

  // Product image - giữ chất lượng tốt
  product: "w_800,h_800,c_pad,b_white,q_auto:best,f_auto",

  // Background - giảm quality cho background
  background: "w_1920,h_1080,c_fill,q_auto:low,f_auto,e_blur:300",
} as const;

/**
 * Allowed image formats
 */
export const ALLOWED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

/**
 * Default max file size in MB
 */
export const DEFAULT_MAX_FILE_SIZE_MB = 5;

/**
 * Helper function để tạo transformation string
 */
export const createTransformation = (
  options: TransformationOptions,
): string => {
  const parts: string[] = [];

  if (options.width) parts.push(`w_${options.width}`);
  if (options.height) parts.push(`h_${options.height}`);
  if (options.crop) parts.push(`c_${options.crop}`);
  if (options.quality) parts.push(`q_${options.quality}`);
  if (options.format) parts.push(`f_${options.format}`);
  if (options.gravity) parts.push(`g_${options.gravity}`);
  if (options.radius) parts.push(`r_${options.radius}`);
  if (options.background) parts.push(`b_${options.background}`);
  if (options.effect) parts.push(`e_${options.effect}`);

  return parts.join(",");
};

/**
 * Validate và format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Kiểm tra file có phải là ảnh không
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith("image/");
};

/**
 * Lấy kích thước file theo MB
 */
export const getFileSizeInMB = (file: File): number => {
  return file.size / (1024 * 1024);
};
