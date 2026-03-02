import type { WorkInformationProps } from "../types/profile.types";

export default function WorkInformation({ profile }: WorkInformationProps) {
  const getRoleBadgeColor = (scope: string) => {
    return scope === "GLOBAL"
      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      : "bg-[#e69019]/10 text-[#e69019] dark:bg-[#e69019]/20 dark:text-[#e69019]";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Thông tin công việc
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phạm vi vai trò
          </label>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(
                profile.role_scope,
              )}`}
            >
              {profile.role_scope === "GLOBAL" ? "Toàn hệ thống" : "Chi nhánh"}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {profile.role_scope === "GLOBAL"
                ? "Truy cập tất cả chi nhánh"
                : "Giới hạn trong chi nhánh được gán"}
            </span>
          </div>
        </div>

        {profile.role_scope === "FRANCHISE" && profile.franchise_name && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chi nhánh được gán
            </label>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-[#e69019]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <p className="text-gray-900 dark:text-white">
                {profile.franchise_name}
              </p>
            </div>
          </div>
        )}

        {profile.today_shift && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ca làm hôm nay
            </label>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-[#e69019]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-900 dark:text-white font-medium">
                {profile.today_shift}
              </p>
            </div>
          </div>
        )}

        {profile.last_login && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Đăng nhập lần cuối
            </label>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {profile.last_login}
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Trạng thái tài khoản
          </label>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              profile.is_active
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {profile.is_active
              ? "Đang hoạt động - Toàn quyền truy cập"
              : "Ngừng hoạt động - Truy cập hạn chế"}
          </span>
        </div>
      </div>
    </div>
  );
}
