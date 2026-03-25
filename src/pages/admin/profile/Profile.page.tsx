import { useEffect, useState, type SyntheticEvent } from "react";
import { toast } from "react-toastify";
import {
  User,
  Building2,
  Shield,
  Loader,
  Lock,
  Edit3,
} from "lucide-react";
import { getAdminProfile } from "../auth/login/services/auth03.service";
import {
  updateAdminProfile,
  type UpdateAdminProfileRequest,
} from "../auth/login/services/auth04.service";
import { changePassword } from "@/pages/admin/auth/login/services/auth06.service";
import type {
  AdminLoginUserProfile,
  AdminProfileResponse,
  AdminRoleLike,
} from "../auth/login/models/api.model";

const ProfilePage = () => {
  const [profile, setProfile] = useState<AdminProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isUpdateProfileModalOpen, setIsUpdateProfileModalOpen] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [updateProfileFormData, setUpdateProfileFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    avatar_url: string;
  }>({
    name: "",
    email: "",
    phone: "",
    avatar_url: "",
  });
  const [passwordFormData, setPasswordFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
       
        const response = await getAdminProfile();
        setProfile(response);
      
        toast.success("Tải thông tin profile thành công!");
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        const errorMessage = err?.message || "Failed to load profile";
        setError(errorMessage);
        toast.error(`Lỗi: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChangePasswordSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (passwordFormData.new_password !== passwordFormData.confirm_password) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }

    if (passwordFormData.new_password.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setIsSubmittingPassword(true);
      const response = await changePassword(
        passwordFormData.old_password,
        passwordFormData.new_password,
      );

      if (response.success) {
        toast.success("Đổi mật khẩu thành công!");
        setIsChangePasswordModalOpen(false);
        setPasswordFormData({
          old_password: "",
          new_password: "",
          confirm_password: "",
        });
      } else {
        toast.error(response.message || "Không thể đổi mật khẩu");
      }
    } catch (err: any) {
      console.error("Error changing password:", err);
      toast.error(err?.message || "Lỗi khi đổi mật khẩu");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleOpenChangePasswordModal = () => {
    setPasswordFormData({
      old_password: "",
      new_password: "",
      confirm_password: "",
    });
    setIsChangePasswordModalOpen(true);
  };

  const handleCloseChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
    setPasswordFormData({
      old_password: "",
      new_password: "",
      confirm_password: "",
    });
  };

  const handleOpenUpdateProfileModal = () => {
    setUpdateProfileFormData({
      name: userData?.name ?? "",
      email: userData?.email ?? "",
      phone: userData?.phone ?? "",
      avatar_url: userData?.avatar_url ?? "",
    });
    setIsUpdateProfileModalOpen(true);
  };

  const handleCloseUpdateProfileModal = () => {
    setIsUpdateProfileModalOpen(false);
    setIsSubmittingProfile(false);
    setUpdateProfileFormData({
      name: "",
      email: "",
      phone: "",
      avatar_url: "",
    });
  };

  const handleUpdateProfileSubmit = async (
    e: SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    try {
      setIsSubmittingProfile(true);

      const payload: UpdateAdminProfileRequest = {
        name: updateProfileFormData.name.trim(),
        email: updateProfileFormData.email.trim(),
        phone: updateProfileFormData.phone.trim(),
      };

      const avatarUrl = updateProfileFormData.avatar_url.trim();
      if (avatarUrl) payload.avatar_url = avatarUrl;

      const result = await updateAdminProfile(payload);

      if (!result.success) {
        toast.error(result.message || "Không thể cập nhật thông tin");
        return;
      }

      toast.success("Cập nhật thông tin thành công!");
      setIsUpdateProfileModalOpen(false);

      const refreshed = await getAdminProfile();
      setProfile(refreshed);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi cập nhật thông tin");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const profileData = profile?.data ?? null;
  const userData =
    (profileData as { user?: AdminLoginUserProfile } | null)?.user ??
    (profileData as AdminLoginUserProfile | null);
  const roles =
    (profileData as { roles?: AdminRoleLike[] } | null)?.roles ??
    userData?.roles ??
    [];
  const activeContext =
    (profileData as {
      active_context?: {
        role?: string;
        scope?: string;
        franchiseId?: string | number | null;
        franchiseid?: string | number | null;
      };
    } | null)?.active_context;

  if (!userData) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">No Data</h2>
          <p className="text-yellow-700">No profile data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-8 md:px-20 pb-10 pt-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
              <div className="shrink-0">
                {userData.avatar_url ? (
                  <img
                    src={userData.avatar_url}
                    alt={userData.name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-primary/30"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/30">
                    <User className="w-12 h-12 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 mt-4 sm:mt-0 space-y-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userData.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {userData.email || userData.phone || "Chưa cập nhật thông tin"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin cá nhân
            </h2>
            <button
              type="button"
              onClick={handleOpenUpdateProfileModal}
              className="px-6 py-2 bg-primary hover:bg-[#d17d0f] text-white font-medium rounded-lg transition-colors duration-200 cursor-pointer flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Cập nhật thông tin
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Địa chỉ Email
              </label>
              <div className="px-4 py-2.5 border border-primary/30 rounded-lg bg-primary/5 dark:bg-primary/10">
                <p className="text-gray-900 dark:text-white">{userData.email || "N/A"}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số điện thoại
              </label>
              <div className="px-4 py-2.5 border border-primary/30 rounded-lg bg-primary/5 dark:bg-primary/10">
                <p className="text-gray-900 dark:text-white">{userData.phone || "N/A"}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID người dùng
              </label>
              <div className="px-4 py-2.5 border border-primary/30 rounded-lg bg-primary/5 dark:bg-primary/10">
                <p className="text-gray-900 dark:text-white font-mono text-sm break-all">
                  {userData.id}
                </p>
              </div>
            </div>
          </div>
        </div>

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
                  Cập nhật mật khẩu cho tài khoản quản trị
                </p>
              </div>
              <button
                onClick={handleOpenChangePasswordModal}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200 cursor-pointer flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>

        {activeContext && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Active Context
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Role
                </p>
                <p className="text-sm font-semibold text-primary mt-1">
                  {activeContext.role}
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Scope
                </p>
                <p className="text-sm font-semibold text-primary mt-1">
                  {activeContext.scope}
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Franchise ID
                </p>
                <p className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all mt-1">
                  {activeContext.franchiseId ?? activeContext.franchiseid ?? "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Assigned Roles
          </h3>
          {roles && roles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Shield className="w-5 h-5 text-purple-600 shrink-0" />
                    <span className="text-xs font-semibold px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                      {role.role || role.role_code || "N/A"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Scope
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">
                    {role.scope || "N/A"}
                  </p>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Franchise
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mb-1">
                    {role.franchise_name || "N/A"}
                  </p>
                  <p className="text-xs font-mono text-gray-500 break-all">
                    {role.franchise_id || "N/A"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">No roles assigned</p>
            </div>
          )}
        </div>
      </div>

      {/* Update Profile Modal */}
      {isUpdateProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                Cập nhật thông tin
              </h2>
            </div>

            <form onSubmit={handleUpdateProfileSubmit}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label
                    htmlFor="admin-name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="admin-name"
                    type="text"
                    required
                    value={updateProfileFormData.name}
                    onChange={(e) =>
                      setUpdateProfileFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={updateProfileFormData.email}
                    onChange={(e) =>
                      setUpdateProfileFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập email"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="admin-phone"
                    type="tel"
                    required
                    value={updateProfileFormData.phone}
                    onChange={(e) =>
                      setUpdateProfileFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-avatar-url"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Avatar URL mới
                  </label>
                  <input
                    id="admin-avatar-url"
                    type="url"
                    value={updateProfileFormData.avatar_url}
                    onChange={(e) =>
                      setUpdateProfileFormData((prev) => ({
                        ...prev,
                        avatar_url: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://... (vd URL ảnh đại diện)"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="shrink-0">
                    {updateProfileFormData.avatar_url ? (
                      <img
                        src={updateProfileFormData.avatar_url}
                        alt="Preview avatar"
                        className="w-14 h-14 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Mình sẽ gọi API cập nhật với field `avatar_url` nếu bạn nhập giá
                    trị.
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition ${
                    isSubmittingProfile
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isSubmittingProfile ? "Đang cập nhật..." : "Cập nhật"}
                </button>

                <button
                  type="button"
                  onClick={handleCloseUpdateProfileModal}
                  disabled={isSubmittingProfile}
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                Đổi Mật Khẩu
              </h2>
            </div>
            <form onSubmit={handleChangePasswordSubmit}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label
                    htmlFor="old-password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Mật khẩu hiện tại <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="old-password"
                    type="password"
                    required
                    value={passwordFormData.old_password}
                    onChange={(e) =>
                      setPasswordFormData({
                        ...passwordFormData,
                        old_password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>

                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    value={passwordFormData.new_password}
                    onChange={(e) =>
                      setPasswordFormData({
                        ...passwordFormData,
                        new_password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    value={passwordFormData.confirm_password}
                    onChange={(e) =>
                      setPasswordFormData({
                        ...passwordFormData,
                        confirm_password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Xác nhận mật khẩu mới"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition ${
                    isSubmittingPassword
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isSubmittingPassword ? "Đang xử lý..." : "Đổi Mật Khẩu"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseChangePasswordModal}
                  disabled={isSubmittingPassword}
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
