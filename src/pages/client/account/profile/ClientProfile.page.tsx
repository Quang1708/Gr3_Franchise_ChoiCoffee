import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { UserProfile } from "./types/profile.types";
import ProfileHeader from "./components/ProfileHeader";
import PersonalInformation from "./components/PersonalInformation";
import SecuritySettings from "./components/SecuritySettings";
import ChangePasswordModal from "../change-password/ClientChangePassword.page";
import { getCustomerProfile } from "../partial/service/customerAuth02.service";
import { updateCustomerProfile } from "../partial/service/customer05.service";
import { customerLogout } from "../../auth/services/customerAuth06.service";
import { toastError, toastSuccess } from "@/utils/toast.util";
import ROUTER_URL from "@/routes/router.const";
import { useCustomerAuthStore } from "@/stores/customerAuth.store";
import ClientLoading from "@/components/Client/Client.Loading";

export default function ClientProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get customer from Zustand store
  const customer = useCustomerAuthStore((state) => state.customer);
  const setCustomer = useCustomerAuthStore((state) => state.setCustomer);
  const clearCustomer = useCustomerAuthStore((state) => state.clearCustomer);
  const isInitialized = useCustomerAuthStore((state) => state.isInitialized);

  const [profile, setProfile] = useState<UserProfile>({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    avatar_url: customer?.avatarUrl || "",
    address: customer?.address || "",
  });

  // Redirect if not logged in (only after initialization)
  useEffect(() => {
    if (isInitialized && !customer) {
      toastError("Vui lòng đăng nhập để xem thông tin!");
      navigate(ROUTER_URL.CLIENT_ROUTER.LOGIN);
    } else if (customer) {
      // Sync profile with customer data
      setProfile({
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone,
        avatar_url: customer.avatarUrl || "",
        address: customer.address || "",
      });
    }
  }, [customer, isInitialized, navigate]);

  const handleSaveProfile = async () => {
    if (!customer?.id) {
      toastError("Không tìm thấy thông tin người dùng!");
      return;
    }

    try {
      setIsLoading(true);
      await updateCustomerProfile(String(customer.id), {
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        avatar_url: profile.avatar_url,
      });

      // Update Zustand store with new info
      const updatedInfo = await getCustomerProfile();
      setCustomer({
        id: updatedInfo.id,
        email: updatedInfo.email,
        phone: updatedInfo.phone,
        name: updatedInfo.name,
        avatarUrl: updatedInfo.avatar_url,
        address: updatedInfo.address,
      });

      toastSuccess("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toastError(
        err?.message || "Không thể cập nhật thông tin. Vui lòng thử lại!",
      );
    } finally {
      setIsLoading(false);
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

      // Clear customer from Zustand store
      clearCustomer();

      toastSuccess("Đăng xuất thành công!");

      // Navigate to home page
      navigate(ROUTER_URL.HOME);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toastError(
        err?.response?.data?.message || "Đăng xuất thất bại. Vui lòng thử lại!",
      );
    }
  };

  // Show loading while checking authentication
  if (!isInitialized || isLoading) {
    return <ClientLoading />;
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProfileHeader
          profile={profile}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
        />

        <PersonalInformation
          profile={profile}
          isEditing={isEditing}
          onUpdate={handleUpdateProfile}
        />

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
