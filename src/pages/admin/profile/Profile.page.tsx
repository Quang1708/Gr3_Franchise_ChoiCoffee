/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Mail, Phone, User, Building2, Shield, Loader } from "lucide-react";
import { getAdminProfile } from "../auth/login/services/api.profile";
import type { AdminProfileResponse, AdminUser, AdminRole, ActiveContext } from "../auth/login/services/api.profile";

const ProfilePage = () => {
  const [profile, setProfile] = useState<AdminProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadingToast = toast.loading("Đang tải thông tin profile...");
        const response = await getAdminProfile();
        setProfile(response);
        toast.dismiss(loadingToast);
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

  const userData = profile?.data?.user as AdminUser;
  const roles = profile?.data?.roles as AdminRole[];
  const activeContext = profile?.data?.active_context as ActiveContext;

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
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Profile</h1>

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
              <p className="text-lg font-mono text-gray-800 text-sm break-all">{activeContext.franchiseid}</p>
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
                    {role.role || "N/A"}
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
  );
};

export default ProfilePage;
