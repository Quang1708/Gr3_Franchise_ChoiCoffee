import { useState } from "react";
import {
  uploadImageToCloudinary,
  uploadMultipleImages,
} from "@/services/cloudinary.service";
import type {
  CloudinaryUploadResponse,
  CloudinaryUploadOptions,
} from "@/models/cloudinary.model";

interface UseImageUploadReturn {
  uploadImage: (
    file: File,
    options?: CloudinaryUploadOptions,
  ) => Promise<CloudinaryUploadResponse>;
  uploadImages: (
    files: File[],
    options?: CloudinaryUploadOptions,
  ) => Promise<CloudinaryUploadResponse[]>;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  uploadedImageUrl: string | null;
  uploadedImageUrls: string[];
  reset: () => void;
}

/**
 * Custom hook để upload ảnh lên Cloudinary
 */
export const useImageUpload = (): UseImageUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

  const uploadImage = async (
    file: File,
    options?: CloudinaryUploadOptions,
  ): Promise<CloudinaryUploadResponse> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const response = await uploadImageToCloudinary(file, options);
      setUploadedImageUrl(response.secure_url);
      setUploadProgress(100);
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi khi upload ảnh";
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadImages = async (
    files: File[],
    options?: CloudinaryUploadOptions,
  ): Promise<CloudinaryUploadResponse[]> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const responses = await uploadMultipleImages(files, options);
      const urls = responses.map((res) => res.secure_url);
      setUploadedImageUrls(urls);
      setUploadProgress(100);
      return responses;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi khi upload ảnh";
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
    setUploadedImageUrl(null);
    setUploadedImageUrls([]);
  };

  return {
    uploadImage,
    uploadImages,
    isUploading,
    uploadProgress,
    error,
    uploadedImageUrl,
    uploadedImageUrls,
    reset,
  };
};
