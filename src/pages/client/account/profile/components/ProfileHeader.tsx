import type { ProfileHeaderProps } from "../types/profile.types";
import AvatarUpload from "../../partial/AvatarUpload";

export default function ProfileHeader({
  profile,
  onAvatarUpdate,
}: ProfileHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-20 pb-10 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
          <AvatarUpload
            avatarUrl={profile.avatar_url}
            profileName={profile.name}
            onAvatarUpdate={onAvatarUpdate}
          />

          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {profile.email || profile.phone}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
