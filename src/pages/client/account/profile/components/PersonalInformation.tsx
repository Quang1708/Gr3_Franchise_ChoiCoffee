import type { PersonalInformationProps } from "../types/profile.types";

export default function PersonalInformation({
  profile,
  isEditing,
  onUpdate,
}: PersonalInformationProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Thông tin cá nhân
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Họ và tên
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e69019] focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900 dark:text-white">{profile.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Số điện thoại
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => onUpdate({ phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e69019] focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900 dark:text-white">{profile.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Địa chỉ
          </label>
          {isEditing ? (
            <textarea
              value={profile.address}
              onChange={(e) => onUpdate({ address: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e69019] focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900 dark:text-white">
              {profile.address || "Chưa cập nhật"}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Địa chỉ Email
          </label>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {profile.email}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
            Email không thể thay đổi
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vai trò
          </label>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {profile.role_name}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
            Liên hệ quản trị viên để thay đổi vai trò
          </span>
        </div>

        {profile.role_scope === "FRANCHISE" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chi nhánh được gán
            </label>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {profile.franchise_name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
