import React, { useState } from "react";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import ROUTER_URL from "@/routes/router.const";
import { AdminForgotPasswordSchema } from "./login/schema/AdminForgotReset.schema";
import { forgotPassword } from "./login/services/adminAuth.service";
import { zodResolver } from "@hookform/resolvers/zod";

type FormValues = {
  email: string;
};

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [successMessage] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onChange",
    resolver: zodResolver(AdminForgotPasswordSchema),
  });

  const hasError = !!errors.email;

  const onSubmit = async (values: FormValues) => {
    const res = await forgotPassword(values.email.trim());

    if (!res?.success) {
      setError("email", {
        type: "manual",
        message: res?.message || "Không thể xử lý yêu cầu.",
      });
      return;
    }

    navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN, {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">
            CHOICOFFEE
          </h1>
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">
            Quên mật khẩu
          </p>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-charcoal font-semibold">Email</label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail size={18} />
            </span>

            <input
              type="text"
              placeholder="Email"
              disabled={isSubmitting}
              {...register("email")}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all
              ${
                hasError
                  ? "border-orange-400 bg-orange-50 focus:ring-orange-400"
                  : "border-gray-300 bg-white focus:ring-primary"
              }
              ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
            `}
            />
          </div>

          <div className="min-h-[18px]">
            {hasError && (
              <span className="text-xs text-orange-500 font-medium">
                {errors.email?.message}
              </span>
            )}
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 text-center">
            <span className="text-xs text-primary font-medium">
              {successMessage}
            </span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`h-11 w-full mt-6 rounded-lg text-white font-bold text-sm uppercase tracking-wide transition-all shadow-md
          ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-[#d48315] hover:shadow-lg active:scale-[0.98]"
          }
        `}
        >
          {isSubmitting ? "Đang xử lý..." : "Gửi yêu cầu"}
        </button>

        {/* Back */}
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-primary transition-colors"
            onClick={() => navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN)}
          >
            Về đăng nhập
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
