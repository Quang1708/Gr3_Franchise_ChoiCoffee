import React, { useState } from "react";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ROUTER_URL from "../../../routes/router.const";
import { AdminResetPasswordSchema } from "./login/schema/AdminAuth.schema";
import { ZodError } from "zod";

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      AdminResetPasswordSchema.parse({ password, confirm });
      setError("");
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        setError(err.issues?.[0]?.message || "Có lỗi xảy ra");
      } else {
        setError("Có lỗi xảy ra");
      }
      setSuccess(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col items-center justify-center gap-2 p-10 bg-white shadow-2xl rounded-2xl font-inter border border-gray-100">
        <div className="flex flex-col items-center gap-1 w-full mb-2">
          <h1 className="text-3xl font-extrabold text-black tracking-tight">ChoiCoffee</h1>
          <span className="text-sm text-gray-700">Đặt lại mật khẩu cho tài khoản quản trị</span>
        </div>
        <div className="w-full flex flex-col gap-0.5 mt-0">
          <label className="text-xs text-[#8B8E98] font-semibold mb-1" htmlFor="password_field">Mật khẩu mới</label>
          <div className="relative flex items-center w-full">
            <span className="absolute left-3">
              <Lock size={20} color="#222" />
            </span>
            <input
              placeholder="Nhập mật khẩu mới"
              title="Mật khẩu mới"
              name="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input_field w-full h-10 pl-10 rounded-lg outline-none border border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-200 bg-gray-50 shadow-sm transition-all"
              id="password_field"
              required
            />
          </div>
        </div>
        <div className="w-full flex flex-col gap-0.5 mt-0">
          <label className="text-xs text-[#8B8E98] font-semibold mb-1" htmlFor="confirm_field">Nhập lại mật khẩu</label>
          <div className="relative flex items-center w-full">
            <span className="absolute left-3">
              <Lock size={20} color="#222" />
            </span>
            <input
              placeholder="Nhập lại mật khẩu"
              title="Nhập lại mật khẩu"
              name="confirm"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="input_field w-full h-10 pl-10 rounded-lg outline-none border border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-200 bg-gray-50 shadow-sm transition-all"
              id="confirm_field"
              required
            />
          </div>
        </div>
        <div className="min-h-[20px]">
          {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
        </div>
        <button
          title="Đặt lại mật khẩu"
          type="submit"
          className="w-full h-10 border-0 bg-black rounded-lg outline-none text-white cursor-pointer mt-2 font-semibold shadow-lg hover:bg-gray-800 transition"
        >
          <span>Đặt lại mật khẩu</span>
        </button>
        {success && <p className="text-xs text-green-600 mt-2 text-center">Mật khẩu đã được thay đổi thành công!</p>}
        <div className="w-full flex justify-end items-center mt-2">
          <button type="button" className="text-xs text-black hover:text-gray-800 cursor-pointer" onClick={() => navigate(ROUTER_URL.ADMIN_ROUTER.LOGIN)}>Về đăng nhập</button>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
