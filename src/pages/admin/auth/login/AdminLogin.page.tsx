import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ROUTER_URL from "@/routes/router.const";
import logo from "@/assets/Logo/Logo.png";
import {
  AdminAuthSchema,
  type AdminAuthSchemaType,
} from "./schema/AdminAuth.schema";
import { useAuthStore } from "@/stores/auth.store";
import { toastSuccess } from "@/utils/toast.util";
import { getAdminProfile, loginAdmin } from "./service/api.login";


const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<AdminAuthSchemaType>({ resolver: zodResolver(AdminAuthSchema) });

  const setAuthError = (message: string) => {
    setError("email", { type: "manual", message });
    setError("password", { type: "manual", message });
  };

  const normalizeRoles = (roles: unknown) =>
    Array.isArray(roles)
      ? roles.map((r) =>
          typeof r === "object" && r !== null && "role" in r
            ? { ...(r as object), role_code: (r as { role?: string }).role }
            : r,
        )
      : roles;

  const buildUser = (data: unknown) => {
    const user = (data as { user?: unknown } | null)?.user ?? data;
    const roles = normalizeRoles((data as { roles?: unknown } | null)?.roles);

    return user && Array.isArray(roles) ? { ...(user as object), roles } : user;
  };

  const handleLoginSuccess = (user: unknown, token: string) => {
    useAuthStore.getState().login(user, token);
    toastSuccess?.("Đăng nhập thành công!");
    clearErrors();
    navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_DASHBOARD, { replace: true });
  };

  const onSubmit = async (values: AdminAuthSchemaType) => {
    try {
      const result = await loginAdmin(values);

      if (!result.success) {
        setAuthError(result.message ?? "Đăng nhập thất bại.");
        return;
      }

      if (result.data) {
        const user = buildUser(result.data);
        handleLoginSuccess(user ?? result.data.user, result.data.token);
        return;
      }

      const profile = await getAdminProfile();
      const user = profile.success ? buildUser(profile.data) : null;

      if (user) {
        handleLoginSuccess(user, "SESSION");
        return;
      }

      setAuthError(result.message ?? profile.message ?? "Đăng nhập thất bại.");
    } catch (error) {
      console.error(error);
      setAuthError("Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light px-4">
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
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                {...register("email")}
              />
            </div>
            {errors.email?.message && (
              <span className="text-xs text-red-500 font-medium">
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
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                {...register("password")}
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
              <span className="text-xs text-red-500 font-medium">
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
