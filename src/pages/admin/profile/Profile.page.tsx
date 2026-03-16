/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type SyntheticEvent } from "react";
import { toast } from "react-toastify";
import { Mail, Phone, User, Building2, Shield, Loader, Lock } from "lucide-react";
import { getAdminProfile } from "../auth/login/services/auth03.service";
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
    <div className="p-6 h-screen overflow-hidden flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Profile</h1>
          <button
            onClick={handleOpenChangePasswordModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Lock size={18} />
            <span>Đổi Mật Khẩu</span>
          </button>
        </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            {userData.avatar_url ? (
              <img
                src={userData.avatar_url}
                alt={userData.name}
                className="w-32 h-32 rounded-full border-4 border-blue-600 shadow-lg object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                <User className="w-16 h-16 text-white" />
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-800 mt-4">{userData.name}</h2>
          </div>

          {/* User Details */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-gray-600">Email</p>
                  <p className="text-lg text-gray-800">{userData.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-gray-600">Phone</p>
                  <p className="text-lg text-gray-800">{userData.phone || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <User className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-gray-600">ID</p>
                  <p className="text-lg text-gray-800 font-mono text-sm break-all">{userData.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Context Card */}
      {activeContext && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Active Context
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-600">Role</p>
              <p className="text-lg font-semibold text-blue-600 mt-1">{activeContext.role}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-600">Scope</p>
              <p className="text-lg font-semibold text-blue-600 mt-1">{activeContext.scope}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-600">Franchise ID</p>
              <p className="text-lg font-mono text-gray-800 text-sm break-all">
                {activeContext.franchiseId ?? activeContext.franchiseid}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Roles Card */}
      {roles && roles.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Assigned Roles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <Shield className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-xs font-semibold px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                    {role.role || role.role_code || "N/A"}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-600">Scope</p>
                <p className="text-sm text-gray-800 mb-3">{role.scope || "N/A"}</p>
                <p className="text-sm font-semibold text-gray-600">Franchise</p>
                <p className="text-sm text-gray-800 mb-1">{role.franchise_name || "N/A"}</p>
                <p className="text-xs font-mono text-gray-500 break-all">{role.franchise_id || "N/A"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!roles || roles.length === 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">No roles assigned</p>
        </div>
      )}
      </div>

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
