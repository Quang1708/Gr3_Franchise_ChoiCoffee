import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClientLoginSchema,
  type ClientLoginSchemaType,
} from "./schema/clientLogin.schema";
import ROUTER_URL from "../../../../routes/router.const";
import { setItemInLocalStorage } from "../../../../utils/localStorage.util";
import { LOCAL_STORAGE } from "../../../../consts/localstorage.const";
import { toastSuccess, toastError } from "../../../../utils/toast.util";
import { FAKE_ADMIN_USERS } from "../../../../mocks/dataUser.const";
import { ROLE } from "../../../../models/role.model";

const ClientLoginPage: React.FC = () => {
  const [form, setForm] = useState<ClientLoginSchemaType>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = ClientLoginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    // Xử lý đăng nhập
    const foundUser = FAKE_ADMIN_USERS.find(
      (u) =>
        (u.email === form.email || u.phone === form.email) &&
        u.password_hash === form.password &&
        u.role === ROLE.CUSTOMER,
    );

    if (foundUser) {
      setItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_CLIENT, foundUser);
      toastSuccess("Đăng nhập thành công!");
      setTimeout(() => {
        navigate(ROUTER_URL.HOME);
      }, 1000);
    } else {
      toastError("Email/Số điện thoại hoặc mật khẩu không đúng!");
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-2/3 relative flex-col justify-center items-center bg-charcoal overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-center bg-no-repeat bg-cover"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070")',
              filter: "blur(2px)",
            }}
          ></div>
          <div className="absolute inset-0 bg-charcoal-dark/80"></div>
        </div>
        <div className="relative z-10 text-center flex flex-col items-center p-12">
          <div className="mb-8">
            <svg
              className="w-16 h-16 text-primary"
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                fill="currentColor"
                fillRule="evenodd"
              ></path>
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3 uppercase">
            ChoiCoffee
          </h1>
          <div className="h-1 w-16 bg-primary mb-4"></div>
          <p className="text-white/80 text-lg max-w-md font-medium">
            Cùng thưởng thức cà phê tuyệt vời
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/3 flex items-center justify-center p-8 sm:p-10 lg:p-12">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="bg-charcoal p-2 rounded-lg text-primary">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                  fill="currentColor"
                  fillRule="evenodd"
                ></path>
              </svg>
            </div>
            <h2 className="text-charcoal text-xl font-extrabold uppercase">
              ChoiCoffee
            </h2>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-charcoal mb-2">
              Đăng nhập
            </h2>
            <p className="text-charcoal/50 text-sm font-medium">
              Đăng nhập để trải nghiệm dịch vụ tốt nhất.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email or Phone */}
            <div className="space-y-6">
              <label className="text-sm font-bold tracking-widest text-charcoal/80 ml-1">
                Email
              </label>
              <div className="relative group">
                <input
                  className="w-full pl-4 pr-10 py-3 bg-neutral-soft border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-charcoal font-medium shadow-sm text-sm"
                  placeholder="partner@example.com"
                  type="text"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && (
                <span className="text-xs text-red-500 ml-1">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="ml-1">
                <label className="text-sm font-bold tracking-widest text-charcoal/80 ml-1">
                  Mật khẩu
                </label>
              </div>
              <div className="relative group">
                <input
                  className="w-full pl-4 pr-10 py-3 bg-neutral-soft border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-charcoal font-medium shadow-sm text-sm"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-charcoal transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <div className="flex justify-end">
                <a
                  className="text-xs font-bold text-primary hover:text-wood-brown transition-colors cursor-pointer"
                  onClick={() =>
                    navigate(ROUTER_URL.CLIENT_ROUTER.FORGOT_PASSWORD)
                  }
                >
                  Quên mật khẩu?
                </a>
              </div>
              {errors.password && (
                <span className="text-xs text-red-500 ml-1">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Remember */}
            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary transition-all cursor-pointer"
                  type="checkbox"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                />
                <span className="text-sm font-semibold text-charcoal/60 group-hover:text-charcoal transition-colors">
                  Ghi nhớ đăng nhập
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 group active:scale-[0.98] cursor-pointer"
              type="submit"
            >
              <span>Đăng nhập</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-charcoal/50 text-sm font-medium">
              Bạn chưa có tài khoản?
              <a
                className="text-primary font-bold hover:underline ml-1 cursor-pointer"
                onClick={() => navigate(ROUTER_URL.CLIENT_ROUTER.REGISTER)}
              >
                Đăng ký tài khoản mới
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-2 items-center justify-center text-[11px] font-bold text-charcoal/30 uppercase tracking-wider">
            <div className="flex gap-4">
              <a
                className="hover:text-primary transition-colors cursor-pointer"
                onClick={() => navigate(ROUTER_URL.HOME)}
              >
                Về trang chủ
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLoginPage;
