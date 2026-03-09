import type { ProfileHeaderProps } from "../types/profile.types";

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-20 pb-10 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
          <div className="-mt-16 mb-4 sm:mb-0">
            <img
              src={profile.avatar_url || "/default-avatar.png"}
              alt={profile.name}
              className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
            />
          </div>

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
