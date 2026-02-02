import React from "react";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import ROUTER_URL from "../../../routes/router.const";
import { AdminForgotPasswordSchema } from "./login/schema/AdminForgotReset.schema";
import { FAKE_ADMIN_USERS } from "../../../mocks/dataUser.const";

type FormValues = {
  email: string;
};

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>({
    resolver: zodResolver(AdminForgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  const onSubmit = async (values: FormValues) => {
    const email = values.email.trim().toLowerCase();

    const exists = FAKE_ADMIN_USERS.some(
      (u) => (u.email ?? "").trim().toLowerCase() === email,
    );

    if (!exists) {
      setError("email", {
        type: "manual",
        message: "Email không tồn tại trong hệ thống.",
      });
      return;
    }

    await new Promise((r) => setTimeout(r, 300));
    // eslint-disable-next-line react-hooks/purity
    const fakeToken = `reset.${btoa(email)}.${Date.now()}`;

    navigate(
      `${ROUTER_URL.ADMIN_ROUTER.VERIFY_TOKEN}?type=reset&token=${encodeURIComponent(fakeToken)}`,
      { replace: true },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md flex flex-col items-center justify-center gap-2 p-10 bg-white shadow-2xl rounded-2xl font-inter border border-gray-100"
      >
        <div className="flex flex-col items-center gap-1 w-full mb-2">
          <h1 className="text-2xl font-extrabold text-black tracking-tight">
            Quên mật khẩu
          </h1>
          <span className="text-sm text-gray-700">
            Nhập email để nhận liên kết đặt lại mật khẩu
          </span>
        </div>

        <div className="w-full flex flex-col gap-0.5 mt-0">
          <label
            className="text-xs text-[#8B8E98] font-semibold mb-1"
            htmlFor="email_field"
          >
            Email
          </label>

          <div className="relative flex items-center w-full">
            <span className="absolute left-3">
              <Mail size={20} color="#222" />
            </span>
            <input
              id="email_field"
              type="text"
              placeholder="Nhập email"
              title="Email"
              className="input_field w-full h-10 pl-10 rounded-lg outline-none border border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-200 bg-gray-50 shadow-sm transition-all text-gray-900 placeholder:text-gray-400"
              {...register("email")}
            />
          </div>

          <div className="min-h-[20px]">
            {errors.email?.message && (
              <p className="text-xs text-red-500 mt-2 text-center">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <button
          title="Gửi liên kết"
          type="submit"
          disabled={isSubmitting}
          className={`w-full h-10 border-0 rounded-lg outline-none text-white cursor-pointer mt-2 font-semibold shadow-lg transition
            ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"}`}
        >
          <span>{isSubmitting ? "Đang gửi..." : "Gửi liên kết"}</span>
        </button>

        {isSubmitSuccessful && !errors.email && (
          <p className="text-xs text-green-600 mt-2 text-center">
            Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.
          </p>
        )}

        <div className="w-full flex justify-between items-center mt-2">
          <button
            type="button"
            className="text-xs text-gray-400 hover:text-gray-800 cursor-pointer"
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
