import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import ROUTER_URL from "@/routes/router.const";
import {
  AdminResetPasswordSchema,
  type AdminResetPasswordSchemaType,
} from "./login/schema/AdminAuth.schema";
import { changePassword } from "@/pages/admin/auth/login/services/auth06.service";
import { toastError, toastSuccess } from "@/utils/toast.util";

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminResetPasswordSchemaType>({
    resolver: zodResolver(AdminResetPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (values: AdminResetPasswordSchemaType) => {
    const res = await changePassword(values.old_password, values.new_password);

    if (!res?.success) {
      toastError(res?.message || "Đổi mật khẩu thất bại.");
      return;
    }

    setSuccess(true);
    toastSuccess("Đổi mật khẩu thành công!");

    setTimeout(() => {
      navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN, {
        replace: true,
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="flex flex-col items-center gap-2 mb-8">
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">
            CHOICOFFEE
          </h1>
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">
            Đổi mật khẩu
          </p>
        </div>

        {/* Old Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-charcoal">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={18} />
            </span>
            <input
              type="password"
              {...register("old_password")}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all
              ${
                errors.old_password
                  ? "border-orange-400 bg-orange-50 focus:ring-orange-400"
                  : "border-gray-300 bg-white focus:ring-primary"
              }`}
            />
          </div>
          {errors.old_password && (
            <span className="text-xs text-orange-500 font-medium">
              {errors.old_password.message}
            </span>
          )}
        </div>

        {/* New Password */}
        <div className="flex flex-col gap-1.5 mt-4">
          <label className="text-sm font-semibold text-charcoal">
            Mật khẩu mới
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={18} />
            </span>
            <input
              type="password"
              {...register("new_password")}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all
              ${
                errors.new_password
                  ? "border-orange-400 bg-orange-50 focus:ring-orange-400"
                  : "border-gray-300 bg-white focus:ring-primary"
              }`}
            />
          </div>
          {errors.new_password && (
            <span className="text-xs text-orange-500 font-medium">
              {errors.new_password.message}
            </span>
          )}
        </div>

        {/* Confirm */}
        <div className="flex flex-col gap-1.5 mt-4">
          <label className="text-sm font-semibold text-charcoal">
            Nhập lại mật khẩu
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={18} />
            </span>
            <input
              type="password"
              {...register("confirm")}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all
              ${
                errors.confirm
                  ? "border-orange-400 bg-orange-50 focus:ring-orange-400"
                  : "border-gray-300 bg-white focus:ring-primary"
              }`}
            />
          </div>
          {errors.confirm && (
            <span className="text-xs text-orange-500 font-medium">
              {errors.confirm.message}
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || success}
          className={`h-11 w-full mt-6 rounded-lg text-white font-bold text-sm uppercase tracking-wide transition-all shadow-md
            ${
              isSubmitting || success
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-[#d48315] hover:shadow-lg active:scale-[0.98]"
            }`}
        >
          {isSubmitting
            ? "Đang xử lý..."
            : success
              ? "Đã đổi mật khẩu"
              : "Đổi mật khẩu"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
