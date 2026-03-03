import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { UserProfile } from "./types/profile.types";
import ProfileHeader from "./components/ProfileHeader";
import PersonalInformation from "./components/PersonalInformation";
import WorkInformation from "./components/WorkInformation";
import SecuritySettings from "./components/SecuritySettings";
import ChangePasswordModal from "../change-password/ClientChangePassword.page";
import { getCustomerInfo, updateCustomerProfile } from "../partial/service/api";
import { customerLogout } from "../../auth/services/authApi";
import { toastError, toastSuccess } from "@/utils/toast.util";
import ROUTER_URL from "@/routes/router.const";

export default function ClientProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerId, setCustomerId] = useState<string>("");
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    avatar_url: "",
    address: "",
    is_active: false,
    created_at: "",
    role_name: "Customer",
    role_scope: "FRANCHISE",
  });

  // Fetch customer info on mount
  useEffect(() => {
    const fetchCustomerInfo = async () => {
      try {
        setIsLoading(true);
        const data = await getCustomerInfo();
        setCustomerId(data.id);
        setProfile({
          name: data.name,
          email: data.email,
          phone: data.phone,
          avatar_url: data.avatar_url,
          address: data.address,
          is_active: data.is_active,
          created_at: data.created_at,
          role_name: "Customer",
          role_scope: "FRANCHISE",
        });
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        toastError(
          err?.response?.data?.message ||
            "Không thể tải thông tin. Vui lòng thử lại!",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerInfo();
  }, []);

  const handleSaveProfile = async () => {
    try {
      await updateCustomerProfile(customerId, {
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        avatar_url: profile.avatar_url,
      });

      // Update localStorage with new info
      const updatedInfo = await getCustomerInfo();
      localStorage.setItem("customer_info", JSON.stringify(updatedInfo));

      toastSuccess("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toastError(
        err?.response?.data?.message ||
          "Không thể cập nhật thông tin. Vui lòng thử lại!",
      );
    }
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setProfile({ ...profile, ...updates });
  };

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await customerLogout();

      // Clear customer info from localStorage
      localStorage.removeItem("customer_info");

      toastSuccess("Đăng xuất thành công!");

      // Navigate to home page
      setTimeout(() => {
        navigate(ROUTER_URL.HOME);
      }, 1000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toastError(
        err?.response?.data?.message || "Đăng xuất thất bại. Vui lòng thử lại!",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f7f6] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Đang tải thông tin...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f6] dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProfileHeader
          profile={profile}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PersonalInformation
            profile={profile}
            isEditing={isEditing}
            onUpdate={handleUpdateProfile}
          />

          <WorkInformation profile={profile} />
        </div>

        <SecuritySettings
          onChangePassword={handleChangePassword}
          onLogout={handleLogout}
        />
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
}
