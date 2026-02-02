import React, { useEffect, useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ROUTER_URL from "../../../routes/router.const";
import { AdminResetPasswordSchema } from "./login/schema/AdminAuth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toastError, toastSuccess } from "../../../utils/toast.util";
import { SESSION_STORAGE } from "../../../consts/sessionstorage.const";
import {
  getItemInSessionStorage,
  removeItemInSessionStorage,
  setItemInSessionStorage,
} from "../../../utils/sessionStorage.util";
import { resetPassword } from "../../../services/adminAuth.service";

type FormValues = { password: string; confirm: string };

const ResetPasswordPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const tokenFromUrl = (params.get("token") ?? "").trim();
  const tokenFromSession = (
    getItemInSessionStorage<string>(SESSION_STORAGE.RESET_TOKEN) ?? ""
  ).trim();

  const [effectiveToken, setEffectiveToken] = useState<string>(
    () => tokenFromSession || tokenFromUrl,
  );

  const tokenOk = useMemo(
    () => effectiveToken.trim().length >= 10,
    [effectiveToken],
  );

  const [bannerError, setBannerError] = useState("");
  const [success, setSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(AdminResetPasswordSchema),
    defaultValues: { password: "", confirm: "" },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!tokenFromSession && tokenFromUrl.length >= 10) {
      setItemInSessionStorage<string>(
        SESSION_STORAGE.RESET_TOKEN,
        tokenFromUrl,
      );
      setEffectiveToken(tokenFromUrl);
      navigate(ROUTER_URL.ADMIN_ROUTER.RESET_PASSWORD, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (success) {
      setBannerError("");
      return;
    }
    if (!tokenOk) {
      setBannerError(
        "Thiếu hoặc token không hợp lệ. Vui lòng yêu cầu gửi lại liên kết.",
      );
    } else {
      setBannerError("");
    }
  }, [tokenOk, success]);

  const onSubmit = async (values: FormValues) => {
    if (!tokenOk) {
      toastError("Phiên reset không hợp lệ. Vui lòng gửi lại yêu cầu.");
      return;
    }

    const res = await resetPassword(effectiveToken, values.password);
    if (!res.ok) {
      toastError("Đổi mật khẩu thất bại.");
      return;
    }

    setSuccess(true);
    toastSuccess("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");

    setTimeout(() => {
      removeItemInSessionStorage(SESSION_STORAGE.RESET_TOKEN);
      navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN, { replace: true });
    }, 900);
  };

  const { register, handleSubmit, formState } = form;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md flex flex-col items-center justify-center gap-2 p-10 bg-white shadow-2xl rounded-2xl font-inter border border-gray-100"
      >
        <div className="flex flex-col items-center gap-1 w-full mb-2">
          <h1 className="text-3xl font-extrabold text-black tracking-tight">
            ChoiCoffee
          </h1>
          <span className="text-sm text-gray-700">
            Đặt lại mật khẩu cho tài khoản quản trị
          </span>
        </div>

        <div className="mt-2 text-xs w-full">
          <span
            className={tokenOk || success ? "text-green-600" : "text-red-600"}
          >
            {tokenOk || success ? "Token hợp lệ ✅" : "Token không hợp lệ ❌"}
          </span>
        </div>

        {bannerError && (
          <p className="text-xs text-red-500 mt-2 text-center w-full">
            {bannerError}
          </p>
        )}

        <div className="w-full flex flex-col gap-0.5 mt-2">
          <label
            className="text-xs text-[#8B8E98] font-semibold mb-1"
            htmlFor="password_field"
          >
            Mật khẩu mới
          </label>
          <div className="relative flex items-center w-full">
            <span className="absolute left-3">
              <Lock size={20} color="#222" />
            </span>
            <input
              id="password_field"
              type="password"
              placeholder="Nhập mật khẩu mới"
              className="w-full h-10 pl-10 rounded-lg outline-none border border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-200 bg-gray-50 shadow-sm transition-all"
              {...register("password")}
              disabled={!tokenOk || formState.isSubmitting || success}
            />
          </div>
          {formState.errors.password?.message && (
            <span className="text-xs text-red-500 mt-1 block">
              {formState.errors.password.message}
            </span>
          )}
        </div>

        <div className="w-full flex flex-col gap-0.5 mt-2">
          <label
            className="text-xs text-[#8B8E98] font-semibold mb-1"
            htmlFor="confirm_field"
          >
            Nhập lại mật khẩu
          </label>
          <div className="relative flex items-center w-full">
            <span className="absolute left-3">
              <Lock size={20} color="#222" />
            </span>
            <input
              id="confirm_field"
              type="password"
              placeholder="Nhập lại mật khẩu"
              className="w-full h-10 pl-10 rounded-lg outline-none border border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-200 bg-gray-50 shadow-sm transition-all"
              {...register("confirm")}
              disabled={!tokenOk || formState.isSubmitting || success}
            />
          </div>
          {formState.errors.confirm?.message && (
            <span className="text-xs text-red-500 mt-1 block">
              {formState.errors.confirm.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={!tokenOk || formState.isSubmitting || success}
          className={`w-full h-10 border-0 rounded-lg outline-none text-white mt-4 font-semibold shadow-lg transition
            ${!tokenOk || formState.isSubmitting || success ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"}`}
        >
          <span>
            {success
              ? "Đã đổi mật khẩu"
              : formState.isSubmitting
                ? "Đang xử lý..."
                : "Đặt lại mật khẩu"}
          </span>
        </button>

        <div className="w-full flex justify-end items-center mt-2">
          <button
            type="button"
            className="text-xs text-black hover:text-gray-800 cursor-pointer"
            onClick={() => navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN)}
          >
            Về đăng nhập
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
