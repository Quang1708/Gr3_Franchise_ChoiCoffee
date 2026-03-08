import { CLOUDINARY_CONFIG } from "@/config/cloudinary.config";
import type {
  CloudinaryUploadResponse,
  CloudinaryUploadOptions,
} from "@/models/cloudinary.model";
import {
  ALLOWED_IMAGE_FORMATS,
  DEFAULT_MAX_FILE_SIZE_MB,
} from "@/consts/cloudinary.const";

/**
 * Upload ảnh lên Cloudinary
 * @param file - File ảnh cần upload
 * @param options - Các options bổ sung
 * @returns Promise với CloudinaryUploadResponse
 */
export const uploadImageToCloudinary = async (
  file: File,
  options?: CloudinaryUploadOptions,
): Promise<CloudinaryUploadResponse> => {
  try {
    // Default values
    const maxSizeInMB = options?.maxSizeInMB || DEFAULT_MAX_FILE_SIZE_MB;
    const allowedFormats = (options?.allowedFormats ||
      ALLOWED_IMAGE_FORMATS) as string[];
    const quality = options?.quality || "auto";
    const autoOptimize = options?.autoOptimize !== false; // Default true

    // Kiểm tra file type
    if (!allowedFormats.includes(file.type)) {
      throw new Error(
        `Format không hợp lệ. Chỉ chấp nhận: ${allowedFormats
          .map((f) => f.replace("image/", ""))
          .join(", ")}`,
      );
    }

    // Kiểm tra file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSizeInMB) {
      throw new Error(
        `Kích thước file vượt quá ${maxSizeInMB}MB. File của bạn: ${fileSizeInMB.toFixed(2)}MB`,
      );
    }

    // Tạo FormData để gửi lên Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);

    // Thêm các options nếu có
    if (options?.folder) {
      formData.append("folder", options.folder);
    }

    if (options?.tags && options.tags.length > 0) {
      formData.append("tags", options.tags.join(","));
    }

    if (options?.public_id) {
      formData.append("public_id", options.public_id);
    }

    // Auto optimization
    if (autoOptimize) {
      formData.append("quality", quality.toString());
      formData.append("fetch_format", "auto"); // Tự động chọn format tốt nhất (WebP nếu browser support)
    }

    if (options?.transformation) {
      formData.append("transformation", options.transformation);
    }

    // Build dynamic upload URL
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

    // Upload lên Cloudinary
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Upload thất bại");
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi upload ảnh:", error);
    throw error;
  }
};

/**
 * Upload nhiều ảnh cùng lúc
 * @param files - Danh sách các file ảnh
 * @param options - Các options bổ sung
 * @returns Promise với mảng CloudinaryUploadResponse
 */
export const uploadMultipleImages = async (
  files: File[],
  options?: CloudinaryUploadOptions,
): Promise<CloudinaryUploadResponse[]> => {
  try {
    const uploadPromises = files.map((file) =>
      uploadImageToCloudinary(file, options),
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Lỗi khi upload nhiều ảnh:", error);
    throw error;
  }
};

export const getTransformedImageUrl = (
  publicId: string,
  transformation: string,
): string => {
  const cloudName = CLOUDINARY_CONFIG.cloudName;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
};
