import React from "react";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ROUTER_URL from "@/routes/router.const";
import logo from "@/assets/Logo/Logo.png";
import {
  AdminAuthSchema,
  type AdminAuthSchemaType,
} from "./schema/AdminAuth.schema";
import { toastSuccess } from "@/utils/toast.util";
import { useAuthStore } from "@/stores/auth.store";
import { loginAdmin } from "@/services/adminAuth.service";

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<AdminAuthSchemaType>({
    resolver: zodResolver(AdminAuthSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const getInputClass = (hasError: boolean) =>
    `w-full h-10 pl-10 rounded-lg outline-none border transition ` +
    (hasError
      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50"
      : "border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-200 bg-gray-50");

  const setAuthError = (message: string) => {
    setError("email", { type: "manual", message });
    setError("password", { type: "manual", message });
  };

  const onSubmit = async (values: AdminAuthSchemaType) => {
    try {
      const result = await loginAdmin({
        email: values.email,
        password: values.password,
      });

      if (!result.ok) {
        setAuthError(result.message);
        return;
      }

      useAuthStore.getState().login(result.user, result.token);

      toastSuccess("Đăng nhập thành công!");
      clearErrors();
      navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_DASHBOARD, { replace: true });
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
                className={getInputClass(Boolean(errors.email))}
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
                type="password"
                placeholder="********"
                className={getInputClass(Boolean(errors.password))}
                {...register("password")}
              />
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
