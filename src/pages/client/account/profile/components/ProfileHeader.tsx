import type { ProfileHeaderProps } from "../types/profile.types";

export default function ProfileHeader({
  profile,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: ProfileHeaderProps) {
  const getRoleBadgeColor = (scope: string) => {
    return scope === "GLOBAL"
      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      : "bg-[#e69019]/10 text-[#e69019] dark:bg-[#e69019]/20 dark:text-[#e69019]";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-20 pb-10 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
          <div className="-mt-16 mb-4 sm:mb-0">
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
            />
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {profile.email}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                  profile.role_scope,
                )}`}
              >
                {profile.role_name}
              </span>

              {profile.role_scope === "FRANCHISE" && profile.franchise_name && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {profile.franchise_name}
                </span>
              )}

              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  profile.is_active
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {profile.is_active ? "Đang hoạt động" : "Ngừng hoạt động"}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tham gia {formatDate(profile.created_at)}
            </p>
          </div>

          <div className="mt-4 sm:mt-0">
            {!isEditing ? (
              <button
                onClick={onEdit}
                className="w-full sm:w-auto px-6 py-2 bg-[#e69019] hover:bg-[#d17d0f] text-white font-medium rounded-lg transition-colors duration-200"
              >
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={onSave}
                  className="px-6 py-2 bg-[#e69019] hover:bg-[#d17d0f] text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Lưu
                </button>
                <button
                  onClick={onCancel}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
