import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from "react";
import { toast } from "react-toastify";
import {
  Building2,
  Shield,
  Loader,
  Lock,
  Edit3,
  Camera,
  X,
  User,
} from "lucide-react";
import { getAdminProfile } from "../auth/login/services/auth03.service";
import {
  updateAdminProfile,
  type UpdateAdminProfileRequest,
} from "../auth/login/services/auth04.service";
import { changePassword } from "@/pages/admin/auth/login/services/auth06.service";
import { useAuthStore } from "@/stores/auth.store";
import { useImageUpload } from "@/hooks/useImageUpload";
import type {
  AdminLoginUserProfile,
  AdminProfileResponse,
  AdminRoleLike,
} from "../auth/login/models/api.model";

const ProfilePage = () => {
  const [profile, setProfile] = useState<AdminProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isUpdateProfileModalOpen, setIsUpdateProfileModalOpen] =
    useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [updateProfileFormData, setUpdateProfileFormData] = useState<{
    name: string;
    email: string;
    phone: string;
  }>({
    name: "",
    email: "",
    phone: "",
  });
  const [passwordFormData, setPasswordFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  // ============ Admin Avatar Upload (crop/zoom before upload) ============
  const {
    uploadImage,
    isUploading: isAvatarUploading,
    error: avatarUploadError,
  } = useImageUpload();

  const viewportSize = 240; // px (circle crop viewport)
  const canvasSize = 480; // px (output image)

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [imgNaturalSize, setImgNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // viewport pixels

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (selectedImageUrl) URL.revokeObjectURL(selectedImageUrl);
    };
  }, [selectedImageUrl]);

  const cover = useMemo(() => {
    if (!imgNaturalSize) return null;
    const { width, height } = imgNaturalSize;
    const baseScale = Math.max(viewportSize / width, viewportSize / height);
    const displayW = width * baseScale * zoom;
    const displayH = height * baseScale * zoom;

    const baseLeft = (viewportSize - displayW) / 2;
    const baseTop = (viewportSize - displayH) / 2;

    const left = baseLeft + offset.x;
    const top = baseTop + offset.y;

    return { displayW, displayH, left, top };
  }, [imgNaturalSize, offset.x, offset.y, zoom]);

  const handlePickAvatarFile = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const acceptedFormats = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!acceptedFormats.includes(file.type)) {
      alert("Vui lòng chỉ chọn file ảnh (JPG, PNG, WebP, GIF)");
      e.target.value = "";
      return;
    }

    if (selectedImageUrl) URL.revokeObjectURL(selectedImageUrl);

    const objectUrl = URL.createObjectURL(file);
    setSelectedImageUrl(objectUrl);
    setImgNaturalSize(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setIsAvatarModalOpen(true);

    e.target.value = "";
  };

  const handleCloseAvatarModal = () => {
    setIsAvatarModalOpen(false);
    setImgNaturalSize(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    if (selectedImageUrl) URL.revokeObjectURL(selectedImageUrl);
    setSelectedImageUrl(null);
  };

  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  const syncAuthUserWithProfile = useCallback(
    (res: AdminProfileResponse | null) => {
      const data = res?.data;
      if (!data) return;

      // API can return either: { user, roles, active_context } or AdminLoginUserProfile
      if (typeof data === "object" && data !== null && "user" in data) {
        const user = (data as { user: AdminLoginUserProfile }).user;
        const roles = (data as { roles?: AdminLoginUserProfile["roles"] })
          .roles;
        setAuth({ ...user, roles: roles ?? user.roles }, token);
        return;
      }

      setAuth(data as AdminLoginUserProfile, token);
    },
    [setAuth, token],
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAdminProfile();
        setProfile(response);
        syncAuthUserWithProfile(response);

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
  }, [syncAuthUserWithProfile]);

  const handleChangePasswordSubmit = async (
    e: SyntheticEvent<HTMLFormElement>,
  ) => {
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
    });
  };

  const handleAvatarUpdate = async (avatarUrl: string) => {
    if (!userData) return;

    try {
      const payload: UpdateAdminProfileRequest = {
        name: userData.name ?? "",
        email: userData.email ?? "",
        phone: userData.phone ?? "",
        avatar_url: avatarUrl,
      };

      const result = await updateAdminProfile(userData.id, payload);
      if (!result.success) {
        toast.error(result.message || "Không thể cập nhật ảnh đại diện");
        return;
      }

      toast.success("Cập nhật ảnh đại diện thành công!");
      const refreshed = await getAdminProfile();
      setProfile(refreshed);
      syncAuthUserWithProfile(refreshed);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi cập nhật ảnh đại diện");
    }
  };

  const handleConfirmAvatarUpload = async () => {
    if (!selectedImageUrl || !imgNaturalSize || !cover) return;

    try {
      // Crop on canvas (circle mask)
      const canvas = document.createElement("canvas");
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      const scale = canvasSize / viewportSize;

      // Create circle clipped draw
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2);
      ctx.clip();

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const im = new Image();
        im.crossOrigin = "anonymous";
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.src = selectedImageUrl;
      });

      ctx.drawImage(
        img,
        cover.left * scale,
        cover.top * scale,
        cover.displayW * scale,
        cover.displayH * scale,
      );
      ctx.restore();

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png", 0.92),
      );
      if (!blob) throw new Error("Failed to export cropped avatar");

      const file = new File([blob], `avatar_${Date.now()}.png`, {
        type: "image/png",
      });

      const response = await uploadImage(file, {
        folder: "customer-avatars",
        tags: ["avatar", "customer"],
      });

      await handleAvatarUpdate(response.secure_url);

      setIsAvatarModalOpen(false);
      setImgNaturalSize(null);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setSelectedImageUrl(null);
    } catch (err) {
      console.error("Update profile failed:", err);
      toast.error("Không thể cập nhật ảnh đại diện");
    }
  };

  const handleUpdateProfileSubmit = async (
    e: SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!userData) return;

    try {
      setIsSubmittingProfile(true);

      const payload: UpdateAdminProfileRequest = {
        name: updateProfileFormData.name.trim(),
        email: updateProfileFormData.email.trim(),
        phone: updateProfileFormData.phone.trim(),
      };

      const result = await updateAdminProfile(userData.id, payload);

      if (!result.success) {
        toast.error(result.message || "Không thể cập nhật thông tin");
        return;
      }

      toast.success("Cập nhật thông tin thành công!");
      setIsUpdateProfileModalOpen(false);

      const refreshed = await getAdminProfile();
      setProfile(refreshed);
      syncAuthUserWithProfile(refreshed);
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
  const activeContext = (
    profileData as {
      active_context?: {
        role?: string;
        scope?: string;
        franchiseId?: string | number | null;
        franchiseid?: string | number | null;
      };
    } | null
  )?.active_context;

  if (!userData) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            No Data
          </h2>
          <p className="text-yellow-700">No profile data available</p>
        </div>
      </div>
    );
  }

  const headerAvatarUrl = userData.avatar_url ?? userData.avatarUrl;

  return (
    <div className="min-h-screen bg-background-light dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-8 md:px-20 pb-10 pt-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
              <div className="shrink-0">
                <div className="relative w-28 h-28 rounded-full group">
                  {headerAvatarUrl ? (
                    <img
                      src={headerAvatarUrl}
                      alt={userData.name}
                      className="w-28 h-28 rounded-full object-cover border-4 border-primary/30"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/30">
                      <User className="w-12 h-12 text-primary" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handlePickAvatarFile}
                    className="absolute inset-0 w-28 h-28 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    aria-label="Thay đổi ảnh đại diện"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                </div>
              </div>
              <div className="flex-1 mt-4 sm:mt-0 space-y-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userData.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {userData.email ||
                    userData.phone ||
                    "Chưa cập nhật thông tin"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleAvatarFileChange}
          className="hidden"
        />

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
                <p className="text-gray-900 dark:text-white">
                  {userData.email || "N/A"}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số điện thoại
              </label>
              <div className="px-4 py-2.5 border border-primary/30 rounded-lg bg-primary/5 dark:bg-primary/10">
                <p className="text-gray-900 dark:text-white">
                  {userData.phone || "N/A"}
                </p>
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
                  {activeContext.franchiseId ??
                    activeContext.franchiseid ??
                    "N/A"}
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
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

      {/* Update Avatar Modal (crop/zoom) */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                Thay đổi ảnh đại diện
              </h2>
              <button
                type="button"
                onClick={handleCloseAvatarModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isAvatarUploading}
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-center">
                <div
                  style={{ width: viewportSize, height: viewportSize }}
                  className="rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 relative select-none"
                  onPointerDown={(e) => {
                    if (!cover) return;
                    isDraggingRef.current = true;
                    dragStartRef.current = {
                      startX: e.clientX,
                      startY: e.clientY,
                      startOffsetX: offset.x,
                      startOffsetY: offset.y,
                    };
                  }}
                  onPointerMove={(e) => {
                    if (!isDraggingRef.current || !dragStartRef.current) return;
                    const dx = e.clientX - dragStartRef.current.startX;
                    const dy = e.clientY - dragStartRef.current.startY;
                    setOffset({
                      x: dragStartRef.current.startOffsetX + dx,
                      y: dragStartRef.current.startOffsetY + dy,
                    });
                  }}
                  onPointerUp={() => {
                    isDraggingRef.current = false;
                    dragStartRef.current = null;
                  }}
                  onPointerCancel={() => {
                    isDraggingRef.current = false;
                    dragStartRef.current = null;
                  }}
                >
                  {selectedImageUrl ? (
                    <img
                      src={selectedImageUrl}
                      alt="Crop preview"
                      onLoad={(e) => {
                        const target = e.currentTarget;
                        setImgNaturalSize({
                          width: target.naturalWidth,
                          height: target.naturalHeight,
                        });
                      }}
                      style={{
                        position: "absolute",
                        left: cover ? cover.left : 0,
                        top: cover ? cover.top : 0,
                        width: cover ? cover.displayW : viewportSize,
                        height: cover ? cover.displayH : viewportSize,
                        pointerEvents: "none",
                        userSelect: "none",
                      }}
                      draggable={false}
                    />
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Zoom
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full"
                    disabled={!imgNaturalSize}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {zoom.toFixed(2)}x
                  </div>
                </div>

                {avatarUploadError ? (
                  <p className="text-sm text-red-500">{avatarUploadError}</p>
                ) : null}

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Kéo ảnh để canh vị trí trong khung tròn.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseAvatarModal}
                  disabled={isAvatarUploading}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => void handleConfirmAvatarUpload()}
                  disabled={isAvatarUploading || !selectedImageUrl || !cover}
                  className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAvatarUploading ? "Đang cập nhật..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
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
