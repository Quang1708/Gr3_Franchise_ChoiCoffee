import type { SecuritySettingsProps } from "../types/profile.types";

export default function SecuritySettings({
  onChangePassword,
  onLogout,
}: SecuritySettingsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Cài đặt bảo mật
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Mật khẩu
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Thay đổi lần cuối 30 ngày trước
            </p>
          </div>
          <button
            onClick={onChangePassword}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200 cursor-pointer"
          >
            Đổi mật khẩu
          </button>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Phiên đang hoạt động
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Đăng xuất khỏi tài khoản trên thiết bị này
            </p>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200 cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
