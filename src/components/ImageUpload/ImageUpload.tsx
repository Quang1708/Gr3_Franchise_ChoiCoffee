import React, { useState } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import type { CloudinaryUploadOptions } from "@/models/cloudinary.model";

interface ImageUploadProps {
  onUploadSuccess?: (imageUrl: string) => void;
  folder?: string;
  multiple?: boolean;
  maxFiles?: number;
  acceptedFormats?: string[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadSuccess,
  folder = "uploads",
  multiple = false,
  maxFiles = 5,
  acceptedFormats = ["image/jpeg", "image/png", "image/webp", "image/gif"],
}) => {
  const {
    uploadImage,
    uploadImages,
    isUploading,
    error,
    uploadedImageUrl,
    uploadedImageUrls,
  } = useImageUpload();

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate file types
    const fileArray = Array.from(files);
    const invalidFiles = fileArray.filter(
      (file) => !acceptedFormats.includes(file.type),
    );

    if (invalidFiles.length > 0) {
      alert("Vui lòng chỉ chọn file ảnh (JPG, PNG, WebP, GIF)");
      return;
    }

    // Check max files
    if (multiple && fileArray.length > maxFiles) {
      alert(`Chỉ được upload tối đa ${maxFiles} ảnh`);
      return;
    }

    // Create preview URLs
    const previews = fileArray.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);

    // Upload options
    const options: CloudinaryUploadOptions = {
      folder,
      tags: ["upload", folder],
    };

    try {
      if (multiple) {
        const responses = await uploadImages(fileArray, options);
        responses.forEach((response) => {
          onUploadSuccess?.(response.secure_url);
        });
      } else {
        const response = await uploadImage(fileArray[0], options);
        onUploadSuccess?.(response.secure_url);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const clearPreviews = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  };

  React.useEffect(() => {
    return () => {
      // Cleanup preview URLs on unmount
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="w-full max-w-md mx-auto p-4 border-2 border-dashed border-gray-300 rounded-lg">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="image-upload"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {multiple ? "Chọn ảnh (tối đa " + maxFiles + ")" : "Chọn ảnh"}
          </label>
          <input
            id="image-upload"
            type="file"
            accept={acceptedFormats.join(",")}
            multiple={multiple}
            onChange={handleFileChange}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Loading state */}
        {isUploading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Đang upload...</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Preview images */}
        {previewUrls.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Preview:</h3>
              <button
                onClick={clearPreviews}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Xóa preview
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {previewUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-md"
                />
              ))}
            </div>
          </div>
        )}

        {/* Uploaded image URL */}
        {uploadedImageUrl && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800 font-medium mb-1">
              Upload thành công!
            </p>
            <p className="text-xs text-green-600 break-all">
              {uploadedImageUrl}
            </p>
          </div>
        )}

        {/* Uploaded images URLs */}
        {uploadedImageUrls.length > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800 font-medium mb-2">
              Upload {uploadedImageUrls.length} ảnh thành công!
            </p>
            <div className="space-y-1">
              {uploadedImageUrls.map((url, index) => (
                <p key={index} className="text-xs text-green-600 break-all">
                  {index + 1}. {url}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
