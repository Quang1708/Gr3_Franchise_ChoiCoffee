import { useState } from "react";
import { Camera, X } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import type { ProfileHeaderProps } from "../types/profile.types";

export default function ProfileHeader({
  profile,
  onAvatarUpdate,
}: ProfileHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const { uploadImage, isUploading, error } = useImageUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const acceptedFormats = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!acceptedFormats.includes(file.type)) {
      alert("Vui lòng chỉ chọn file ảnh (JPG, PNG, WebP, GIF)");
      e.target.value = "";
      return;
    }

    try {
      // Upload to Cloudinary immediately
      const response = await uploadImage(file, {
        folder: "customer-avatars",
        tags: ["avatar", "customer"],
      });

      setUploadedUrl(response.secure_url);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      e.target.value = "";
    }
  };

  const handleConfirmUpload = async () => {
    if (!uploadedUrl) return;

    try {
      setIsConfirming(true);
      await onAvatarUpdate(uploadedUrl);

      setIsModalOpen(false);
      setUploadedUrl(null);
    } catch (err) {
      console.error("Update profile failed:", err);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUploadedUrl(null);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-20 pb-10 pt-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
            <div className="mb-4 sm:mb-0 relative group">
              <img
                src={profile.avatar_url || "/default-avatar.png"}
                alt={profile.name}
                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover"
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute inset-0 w-32 h-32 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                aria-label="Thay đổi ảnh đại diện"
              >
                <Camera className="w-8 h-8 text-white" />
              </button>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {profile.email || profile.phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Avatar Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Thay đổi ảnh đại diện
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading || isConfirming}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Preview */}
              <div className="flex justify-center">
                <img
                  src={
                    uploadedUrl || profile.avatar_url || "/default-avatar.png"
                  }
                  alt="Preview"
                  className="w-40 h-40 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                />
              </div>

              {/* File Input */}
              <div>
                <label
                  htmlFor="avatar-upload"
                  className={`block w-full text-center px-4 py-3 rounded-lg transition-colors ${
                    isUploading || isConfirming
                      ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                  } text-gray-700 dark:text-gray-200`}
                >
                  {isUploading
                    ? "Đang tải lên..."
                    : uploadedUrl
                      ? "Chọn ảnh khác"
                      : "Chọn ảnh"}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  disabled={isUploading || isConfirming}
                  className="hidden"
                />
              </div>

              {/* Action Buttons */}
              {uploadedUrl && (
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseModal}
                    disabled={isUploading || isConfirming}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmUpload}
                    disabled={isUploading || isConfirming}
                    className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConfirming ? "Đang cập nhật..." : "Xác nhận"}
                  </button>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              {/* Info */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Hỗ trợ: JPG, PNG, WebP, GIF
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
