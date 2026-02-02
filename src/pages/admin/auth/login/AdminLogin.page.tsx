import React from "react";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import ROUTER_URL from "../../../../routes/router.const";
import {
  AdminAuthSchema,
  type AdminAuthSchemaType,
} from "./schema/AdminAuth.schema";
import {
  setAdminToken,
  setItemInLocalStorage,
} from "../../../../utils/localStorage.util";
import { LOCAL_STORAGE } from "../../../../consts/localstorage.const";
import { toastSuccess, toastError } from "../../../../utils/toast.util";
import { FAKE_ADMIN_USERS } from "../../../../consts/dataUser.const";

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminAuthSchemaType>({
    resolver: zodResolver(AdminAuthSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = async (values: AdminAuthSchemaType) => {
    const foundUser = FAKE_ADMIN_USERS.find(
      (u) => u.email === values.email && u.password_hash === values.password,
    );

    if (foundUser && foundUser.role === "admin") {
      setItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_ADMIN, foundUser);

      // eslint-disable-next-line react-hooks/purity
      const fakeToken = `demo.${btoa(foundUser.email)}.${Date.now()}`;
      setAdminToken(fakeToken);

      toastSuccess("Đăng nhập thành công!");
      setTimeout(() => {
        navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_DASHBOARD, { replace: true });
      }, 600);
      return;
    }

    if (foundUser) {
      toastError("Tài khoản không có quyền truy cập admin!");
      return;
    }

    toastError("Email hoặc mật khẩu không đúng!");
  };

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
            Đăng nhập để quản lý hệ thống cửa hàng
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
              className="input_field w-full h-10 pl-10 rounded-lg outline-none
                border border-gray-200 focus:border-[#115DFC]
                focus:ring-2 focus:ring-blue-100 bg-gray-50 shadow-sm transition-all
                text-gray-900 placeholder:text-gray-400"
              {...register("email")}
            />
          </div>
          <div className="min-h-[20px]">
            {errors.email?.message && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>
        </div>

        <div className="w-full flex flex-col gap-0.5 mt-0">
          <label
            className="text-xs text-[#8B8E98] font-semibold mb-1"
            htmlFor="password_field"
          >
            Mật khẩu
          </label>
          <div className="relative flex items-center w-full">
            <span className="absolute left-3">
              <Lock size={20} color="#222" />
            </span>
            <input
              id="password_field"
              type="password"
              placeholder="Nhập mật khẩu"
              title="Mật khẩu"
              className="input_field w-full h-10 pl-10 rounded-lg outline-none
                border border-gray-200 focus:border-[#115DFC]
                focus:ring-2 focus:ring-blue-100 bg-gray-50 shadow-sm transition-all
                text-gray-900 placeholder:text-gray-400"
              {...register("password")}
            />
          </div>
          <div className="min-h-[20px]">
            {errors.password?.message && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.password.message}
              </span>
            )}
          </div>
        </div>

        <div className="w-full flex justify-between items-center mt-1">
          <a
            href="#"
            className="text-xs text-black hover:text-gray-800"
            onClick={(e) => {
              e.preventDefault();
              navigate(ROUTER_URL.ADMIN_ROUTER.FORGOT_PASSWORD);
            }}
          >
            Quên mật khẩu?
          </a>
          <a
            href={ROUTER_URL.HOME}
            className="text-xs text-gray-400 hover:text-gray-800"
          >
            Về trang chủ
          </a>
        </div>

        <button
          title="Đăng nhập"
          type="submit"
          disabled={isSubmitting}
          className={`w-full h-10 border-0 rounded-lg outline-none text-white mt-2 font-semibold shadow-lg transition
            ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"}`}
        >
          <span>{isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}</span>
        </button>

        <p className="text-xs text-[#8B8E98] underline mt-2 text-center">
          Điều khoản sử dụng &amp; Chính sách
        </p>
      </form>
    </div>
  );
};

export default AdminLoginPage;
