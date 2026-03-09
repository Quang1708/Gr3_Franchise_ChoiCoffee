import type { PersonalInformationProps } from "../types/profile.types";
import { Edit3, Lock } from "lucide-react";

export default function PersonalInformation({
  profile,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onUpdate,
}: PersonalInformationProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Thông tin cá nhân
        </h2>
        <div>
          {!isEditing ? (
            <button
              onClick={onEdit}
              className="px-6 py-2 bg-primary hover:bg-[#d17d0f] text-white font-medium rounded-lg transition-colors duration-200"
            >
              Chỉnh sửa
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={onSave}
                className="px-6 py-2 bg-primary hover:bg-[#d17d0f] text-white font-medium rounded-lg transition-colors duration-200"
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

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Họ và tên
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          ) : (
            <div className="relative group">
              <div className="px-4 py-2.5 border border-dashed border-primary/30 rounded-lg bg-primary/5 dark:bg-primary/10 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-between">
                <p className="text-gray-900 dark:text-white">{profile.name}</p>
                <Edit3 className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
              </div>
            </div>
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          ) : (
            <div className="relative group">
              <div className="px-4 py-2.5 border border-dashed border-primary/30 rounded-lg bg-primary/5 dark:bg-primary/10 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-between">
                <p className="text-gray-900 dark:text-white">{profile.phone}</p>
                <Edit3 className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
              </div>
            </div>
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          ) : (
            <div className="relative group">
              <div className="px-4 py-2.5 border border-dashed border-primary/30 rounded-lg bg-primary/5 dark:bg-primary/10 hover:border-primary/50 transition-colors cursor-pointer flex items-start justify-between min-h-11">
                <p className="text-gray-900 dark:text-white flex-1">
                  {profile.address || "Chưa cập nhật"}
                </p>
                <Edit3 className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors mt-0.5" />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Địa chỉ Email
          </label>
          <div className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">
              {profile.email || "Chưa cập nhật"}
            </p>
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
