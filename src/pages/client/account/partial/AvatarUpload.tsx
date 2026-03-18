import { useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

interface AvatarUploadProps {
  avatarUrl?: string;
  profileName: string;
  onAvatarUpdate: (avatarUrl: string) => Promise<void>;
}

export default function AvatarUpload({
  avatarUrl,
  profileName,
  onAvatarUpdate,
}: AvatarUploadProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const { uploadImage, isUploading, error } = useImageUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      <div className="mb-4 sm:mb-0 relative group">
        <img
          src={avatarUrl || "/default-avatar.png"}
          alt={profileName}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Thay đổi ảnh đại diện
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading || isConfirming}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-center">
                <div className="relative group">
                  <img
                    src={uploadedUrl || avatarUrl || "/default-avatar.png"}
                    alt="Preview"
                    className="w-40 h-40 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`absolute inset-0 w-40 h-40 rounded-full bg-black/40 flex items-center justify-center transition-opacity ${
                      isUploading || isConfirming
                        ? "opacity-100 cursor-not-allowed"
                        : "opacity-0 group-hover:opacity-100 cursor-pointer"
                    }`}
                  >
                    {isUploading ? (
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    ) : (
                      <Camera className="w-10 h-10 text-white" />
                    )}
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
              </div>

              {uploadedUrl && (
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseModal}
                    disabled={isUploading || isConfirming}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmUpload}
                    disabled={isUploading || isConfirming}
                    className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConfirming ? "Đang cập nhật..." : "Xác nhận"}
                  </button>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

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
