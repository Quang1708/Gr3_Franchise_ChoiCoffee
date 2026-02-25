import { useState } from "react";
import type { UserProfile } from "./types/profile.types";
import ProfileHeader from "./components/ProfileHeader";
import PersonalInformation from "./components/PersonalInformation";
import WorkInformation from "./components/WorkInformation";
import SecuritySettings from "./components/SecuritySettings";
import ChangePasswordModal from "../change-password/ClientChangePassword.page";

export default function ClientProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "Nguyen Van A",
    email: "nguyenvana@choicoffee.com",
    phone: "+84 123 456 789",
    avatar_url: "https://i.pravatar.cc/300",
    is_active: true,
    created_at: "2024-01-15",
    role_name: "Store Manager",
    role_scope: "FRANCHISE",
    franchise_name: "Choi Coffee - District 1",
    today_shift: "08:00 - 16:00",
    last_login: "2026-02-23 09:30",
  });

  const handleSaveProfile = () => {
    // TODO: Implement save functionality
    setIsEditing(false);
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setProfile({ ...profile, ...updates });
  };

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleLogout = () => {
    // TODO: Implement logout
    console.log("Logout clicked");
  };

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
