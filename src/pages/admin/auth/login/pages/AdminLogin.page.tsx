import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ROUTER_URL from "@/routes/router.const";
import logo from "@/assets/Logo/Logo.png";
import {
  AdminAuthSchema,
  type AdminAuthSchemaType,
} from "../schema/adminLogin.schema";
import { useAuthStore } from "@/stores/auth.store";
import { SESSION_STORAGE } from "@/consts/sessionstorage.const";
import { toastError, toastSuccess } from "@/utils/toast.util";
import { useAdminContextStore } from "@/stores/adminContext.store";
import type { AdminLoginUserProfile } from "../models/api.model";
import {
  getItemInSessionStorage,
  removeItemInSessionStorage,
  setItemInSessionStorage,
} from "@/utils/sessionStorage.util";
import { runAdminLogin } from "../usecases/login.usecase";
import ClientLoading from "@/components/Client/Client.Loading";

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const user = useAuthStore((s) => s.user);
  const setSelectedFranchiseId = useAdminContextStore(
    (s) => s.setSelectedFranchiseId,
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
  const handleLoginSuccess = (user: AdminLoginUserProfile) => {
    const primaryRole = user.roles?.[0];
    const isStaffRole = primaryRole?.role === "STAFF";
    const roleFranchiseId =
      primaryRole?.franchise_id ??
      (primaryRole as { franchiseId?: string | number } | undefined)
        ?.franchiseId;

    if (roleFranchiseId != null) {
      setSelectedFranchiseId(String(roleFranchiseId));
    } else if (primaryRole?.scope === "GLOBAL") {
      setSelectedFranchiseId(null);
    } else {
      setSelectedFranchiseId(null);
    }
    useAuthStore.getState().login(user, null);
    toastSuccess?.("Đăng nhập thành công!");
    clearErrors();
    navigate(
      isStaffRole
        ? ROUTER_URL.ADMIN_ROUTER.ADMIN_POS
        : ROUTER_URL.ADMIN_ROUTER.ADMIN_DASHBOARD,
      { replace: true },
    );
  };

  useEffect(() => {
    if (!user) return;
    const contextRequired = Boolean(
      getItemInSessionStorage<boolean>(
        SESSION_STORAGE.ADMIN_CONTEXT_REQUIRED,
      ),
    );
    const isStaffRole = user.roles?.[0]?.role === "STAFF";
    navigate(
      contextRequired
        ? ROUTER_URL.ADMIN_ROUTER.ADMIN_SELECT_CONTEXT
        : isStaffRole
          ? ROUTER_URL.ADMIN_ROUTER.ADMIN_POS
          : ROUTER_URL.ADMIN_ROUTER.ADMIN_DASHBOARD,
      { replace: true },
    );
  }, [user, navigate]);

  const onSubmit = async (values: AdminAuthSchemaType) => {
    try {
      const result = await runAdminLogin(values);

      if (result.success && result.user) {
        const user = result.user;
        const hasMultipleRoles =
          Array.isArray(user.roles) && user.roles.length > 1;

        if (hasMultipleRoles) {
          setSelectedFranchiseId(null);
          setItemInSessionStorage(SESSION_STORAGE.ADMIN_CONTEXT_REQUIRED, true);
          useAuthStore.getState().login(user, null);
          navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_SELECT_CONTEXT, {
            replace: true,
          });
          return;
        }

        removeItemInSessionStorage(SESSION_STORAGE.ADMIN_CONTEXT_REQUIRED);
        handleLoginSuccess(user);
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
            <div className="min-h-[20px] mt-1">
              <span
                className={`text-xs font-medium transition-opacity duration-200 ${
                  errors.email ? "text-orange-500 opacity-100" : "opacity-0"
                }`}
              >
                {errors.email?.message ?? "placeholder"}
              </span>
            </div>
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
            <div className="min-h-[20px] mt-1">
              <span
                className={`text-xs font-medium transition-opacity duration-200 ${
                  errors.password ? "text-orange-500 opacity-100" : "opacity-0"
                }`}
              >
                {errors.password?.message ?? "placeholder"}
              </span>
            </div>
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
            {isSubmitting && <ClientLoading />}
            <span>{isSubmitting ? "Đang xử lý..." : "Đăng nhập"}</span>
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
