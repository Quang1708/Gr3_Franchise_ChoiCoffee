import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ROUTER_URL from "@/routes/router.const";
import logo from "@/assets/Logo/Logo.png";
import {
  AdminAuthSchema,
  type AdminAuthSchemaType,
} from "./schema/adminLogin.schema";
import { useAuthStore } from "@/stores/auth.store";
import { toastError, toastSuccess } from "@/utils/toast.util";
import { useAdminContextStore } from "@/stores/adminContext.store";
import type { AdminLoginUserProfile, AdminRoleLike } from "./models/api.model";
import { getAdminProfile, switchAdminContext } from "./services/login.service";
import { runAdminLogin } from "./usecases/login.usecase";

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const setSelectedFranchiseId = useAdminContextStore(
    (s) => s.setSelectedFranchiseId,
  );
  const [contextOpen, setContextOpen] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const [pendingAuth, setPendingAuth] = useState<{
    user: AdminLoginUserProfile;
    token: string;
  } | null>(null);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<AdminAuthSchemaType>({
    resolver: zodResolver(AdminAuthSchema),
    mode: "onChange",
    defaultValues: { email: "group3@gmail.com", password: "123456789" },
  });

  const setAuthError = (message: string) => {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes("email")) {
      setError("email", { type: "manual", message });
      return;
    }

    if (lowerMsg.includes("mật khẩu") || lowerMsg.includes("password")) {
      setError("password", { type: "manual", message });
      return;
    }

    // lỗi chung → highlight cả 2
    setError("email", { type: "manual", message });
    setError("password", { type: "manual", message });
  };
  const handleLoginSuccess = (user: AdminLoginUserProfile, token: string) => {
    if (!pendingAuth) {
      const primaryRole = user.roles?.[0];
      if (primaryRole?.franchise_id != null) {
        setSelectedFranchiseId(primaryRole.franchise_id);
      } else {
        setSelectedFranchiseId(null);
      }
    }
    useAuthStore.getState().login(user, token);
    toastSuccess?.("Đăng nhập thành công!");
    clearErrors();
    navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_DASHBOARD, { replace: true });
  };

  const roles = useMemo(() => {
    if (!pendingAuth?.user) return [];
    return Array.isArray(pendingAuth.user.roles)
      ? (pendingAuth.user.roles as AdminRoleLike[])
      : [];
  }, [pendingAuth]);

  const normalizeRoles = (rolesInput: unknown) =>
    Array.isArray(rolesInput)
      ? rolesInput.map((r) =>
          typeof r === "object" && r !== null && "role" in r
            ? { ...(r as AdminRoleLike), role_code: (r as AdminRoleLike).role }
            : r,
        )
      : rolesInput;

  const getRoleLabel = (role: AdminRoleLike) => {
    if (role.scope === "GLOBAL" || role.franchise_id == null) return "GLOBAL";
    if (role.franchise_name) return role.franchise_name;
    return `FRANCHISE ${role.franchise_id}`;
  };

  const handleSwitchContext = async () => {
    if (!pendingAuth) return;
    if (selectedRoleIndex == null) {
      setContextError("Vui lòng chọn vai trò.");
      return;
    }

    const selected = roles[selectedRoleIndex];
    if (!selected) return;

    setContextLoading(true);
    setContextError(null);

    try {
      await switchAdminContext({ franchise_id: selected.franchise_id ?? "" });

      const profile = await getAdminProfile();
      if (profile.success && profile.data) {
        const user =
          (profile.data as { user?: AdminLoginUserProfile } | null)?.user ??
          (profile.data as AdminLoginUserProfile);
        const normalizedRoles = normalizeRoles(
          (profile.data as { roles?: unknown } | null)?.roles,
        );
        const userWithRoles =
          user && Array.isArray(normalizedRoles)
            ? {
                ...(user as AdminLoginUserProfile),
                roles: normalizedRoles as AdminRoleLike[],
              }
            : user;

        if (selected.franchise_id != null) {
          setSelectedFranchiseId(selected.franchise_id);
        }

        handleLoginSuccess(
          userWithRoles as AdminLoginUserProfile,
          pendingAuth.token,
        );
        setContextOpen(false);
        return;
      }

      setContextError(profile.message ?? "Không thể lấy thông tin tài khoản.");
    } catch (error) {
      console.error(error);
      setContextError("Không thể chuyển ngữ cảnh. Vui lòng thử lại.");
    } finally {
      setContextLoading(false);
    }
  };

  const onSubmit = async (values: AdminAuthSchemaType) => {
    try {
      const result = await runAdminLogin(values);

      if (result.ok && result.user && result.token) {
        const user = result.user;
        const hasMultipleRoles =
          Array.isArray(user.roles) && user.roles.length > 1;

        if (hasMultipleRoles) {
          setPendingAuth({ user, token: result.token });
          setSelectedRoleIndex(null);
          setContextError(null);
          setContextOpen(true);
          return;
        }

        handleLoginSuccess(user, result.token);
        return;
      }

      const errorMessage =
        result.message ??
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      setAuthError(errorMessage);
      toastError?.(errorMessage);
    } catch (error) {
      console.error(error);
      const errorMessage = "Có lỗi xảy ra, vui lòng thử lại sau.";
      setAuthError(errorMessage);
      toastError?.(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light px-4">
      {contextOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="text-lg font-semibold text-gray-900">
              Chọn vai trò làm việc
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Tài khoản này có nhiều vai trò. Vui lòng chọn vai trò để tiếp tục.
            </div>

            <div className="mt-4 space-y-2">
              {roles.map((role, index) => {
                const active = selectedRoleIndex === index;
                return (
                  <button
                    key={`${role.role ?? "role"}-${index}`}
                    type="button"
                    onClick={() => setSelectedRoleIndex(index)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                      active
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-semibold">{role.role ?? "ROLE"}</div>
                    <div className="text-xs text-gray-500">
                      {getRoleLabel(role)}
                    </div>
                  </button>
                );
              })}
            </div>

            {contextError && (
              <div className="mt-3 text-sm text-red-500">{contextError}</div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setContextOpen(false)}
                className="h-9 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={contextLoading}
              >
                Huy
              </button>
              <button
                type="button"
                onClick={handleSwitchContext}
                className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90"
                disabled={contextLoading}
              >
                {contextLoading ? "Dang xu ly..." : "Xac nhan"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-20 h-20 mb-2 border border-gray-200 rounded-full overflow-hidden">
            <img
              src={logo}
              alt="ChoiCoffee Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">
            CHOICOFFEE
          </h1>
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">
            Admin Management
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-charcoal font-semibold">Email</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="text"
                placeholder="Email"
                {...register("email")}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all
    ${
      errors.email
        ? "border-orange-400 bg-orange-50 focus:ring-orange-400"
        : "border-gray-300 bg-white focus:ring-primary"
    }`}
              />
            </div>
            {errors.email?.message && (
              <span className="text-xs text-orange-500 font-medium">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-charcoal font-semibold">
              Mật khẩu
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                {...register("password")}
                className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all
    ${
      errors.password
        ? "border-orange-400 bg-orange-50 focus:ring-orange-400"
        : "border-gray-300 bg-white focus:ring-primary"
    }`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password?.message && (
              <span className="text-xs text-orange-500 font-medium">
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="flex justify-between items-center text-sm">
            <button
              type="button"
              className="text-gray-500 hover:text-primary transition-colors cursor-pointer"
              onClick={() => navigate(ROUTER_URL.ADMIN_ROUTER.FORGOT_PASSWORD)}
            >
              Quên mật khẩu?
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTER_URL.HOME)}
              className="text-gray-500 hover:text-primary transition-colors cursor-pointer"
            >
              Về trang chủ
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`h-11 rounded-lg text-white font-bold text-sm uppercase tracking-wide transition-all shadow-md cursor-pointer
              ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-[#d48315] hover:shadow-lg active:scale-[0.98]"
              }`}
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} ChoiCoffee System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
