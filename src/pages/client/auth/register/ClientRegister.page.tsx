import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClientRegisterSchema,
  type ClientRegisterSchemaType,
} from "./schema/clientRegister.schema";
import ROUTER_URL from "@/routes/router.const";
import { toastSuccess } from "@utils/toast.util";

const ClientRegisterPage: React.FC = () => {
  const [form, setForm] = useState<ClientRegisterSchemaType>({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ClientRegisterSchemaType, string>>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = ClientRegisterSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Partial<
        Record<keyof ClientRegisterSchemaType, string>
      > = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof ClientRegisterSchemaType;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    // Xử lý đăng ký (tạm thời mock)
    console.log("Register data:", form);
    toastSuccess("Đăng ký thành công! Vui lòng đăng nhập.");
    setTimeout(() => {
      navigate(ROUTER_URL.CLIENT_ROUTER.LOGIN);
    }, 1500);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-2/3 relative overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img
            alt="Coffee Roastery"
            className="w-full h-full object-cover brightness-[0.5] contrast-[1.1]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfFGpvsvGnW8SviaazNQSKhUR6-skwsJTEM77ITx2ZB0CRCSyigVS-9YeGyuAS2qg8rW8d9WbNYi50QIKDH8JS-p4bnm94PtEkrqtKxpB3x8B1zHAQuCsPcYnvkViQpGgSTRXirq-HaJG0YilHncFUiBT0yCki20iBz1PplB8T_zrJt7i84cCrRQjXV9zlSVRBc5WSkwz77YjC9Q44bIZB8qqh4wO5fMJ5K82hCHOnQa_F0rLfCRdbxwvlnfUenmYFVH6c5W0y9pdu"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent opacity-60"></div>
        </div>
        <div className="relative z-10 w-full flex flex-col justify-between p-16">
          <div className="flex items-center gap-3">
            <div className="bg-[#e69019] p-2.5 rounded-xl shadow-lg shadow-[#e69019]/20">
              <svg
                className="size-8 text-white"
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
            <span className="text-3xl font-black tracking-tighter text-white uppercase italic">
              ChoiCoffee
            </span>
          </div>
          <div className="max-w-md">
            <div className="h-1 w-12 bg-[#e69019] mb-8"></div>
            <h2 className="text-4xl font-medium text-white mb-6 leading-[1.1] tracking-tight">
              Đối Tác Chiến Lược
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed font-medium">
              Tham gia hệ sinh thái cà phê chất lượng cao cùng ChoiCoffee. Chúng
              tôi cung cấp giải pháp vận hành chuyên nghiệp và nguồn cung ổn
              định cho sự phát triển của bạn.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="w-full lg:w-1/3 flex items-center justify-center p-6 sm:p-8 lg:p-10 bg-white">
        <div className="w-full max-w-lg">
          {/* Logo - Mobile */}
          <div className="mb-12 lg:hidden flex items-center gap-3">
            <div className="bg-[#e69019] p-2 rounded-lg text-white">
              <svg
                className="size-6"
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
            <span className="text-xl font-bold text-slate-900 tracking-tighter">
              ChoiCoffee
            </span>
          </div>

          {/* Header */}
          <div className="mb-2 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              Đăng ký tài khoản
            </h1>
            <p className="text-gray-600 text-sm text-left">
              Điền thông tin bên dưới để được chuyên viên tư vấn hỗ trợ sớm
              nhất.
            </p>
          </div>

          {/* Form */}
          <form noValidate className="space-y-3" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-gray-700 mb-2">
                Họ và tên
              </label>
              <div className="relative group">
                <input
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-slate-900 focus:ring-1 focus:ring-[#e69019] focus:border-[#e69019] outline-none transition-all placeholder:text-gray-400"
                  placeholder="Họ và tên đầy đủ của bạn"
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-[20px] group-focus-within:text-[#e69019] transition-colors">
                  person
                </span>
              </div>
              {errors.fullName && (
                <span className="text-xs text-red-500 ml-1 mt-1 block">
                  {errors.fullName}
                </span>
              )}
            </div>

            {/* Phone & Email */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-gray-700 mb-2">
                Số điện thoại
              </label>
              <div className="relative group">
                <input
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-slate-900 focus:ring-1 focus:ring-[#e69019] focus:border-[#e69019] outline-none transition-all placeholder:text-gray-400"
                  placeholder="09xx xxx xxx"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-[20px] group-focus-within:text-[#e69019] transition-colors">
                  call
                </span>
              </div>
              {errors.phone && (
                <span className="text-xs text-red-500 ml-1 mt-1 block">
                  {errors.phone}
                </span>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-gray-700 mb-2">
                Email
              </label>
              <div className="relative group">
                <input
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-slate-900 focus:ring-1 focus:ring-[#e69019] focus:border-[#e69019] outline-none transition-all placeholder:text-gray-400"
                  placeholder="partner@choicoffee.vn"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-[20px] group-focus-within:text-[#e69019] transition-colors">
                  mail
                </span>
              </div>
              {errors.email && (
                <span className="text-xs text-red-500 ml-1 mt-1 block">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative group">
                <input
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-slate-900 focus:ring-1 focus:ring-[#e69019] focus:border-[#e69019] outline-none transition-all placeholder:text-gray-400"
                  placeholder="Nhập mật khẩu của bạn"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />
                <span
                  className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-[20px] group-focus-within:text-[#e69019] transition-colors cursor-pointer hover:text-[#e69019]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </div>
              {errors.password && (
                <span className="text-xs text-red-500 ml-1 mt-1 block">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative group">
                <input
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-slate-900 focus:ring-1 focus:ring-[#e69019] focus:border-[#e69019] outline-none transition-all placeholder:text-gray-400"
                  placeholder="Nhập lại mật khẩu"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                <span
                  className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-[20px] group-focus-within:text-[#e69019] transition-colors cursor-pointer hover:text-[#e69019]"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "visibility" : "visibility_off"}
                </span>
              </div>
              {errors.confirmPassword && (
                <span className="text-xs text-red-500 ml-1 mt-1 block">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                className="w-full bg-[#e69019] hover:bg-[#e69019]/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-[#e69019]/20 transition-all flex items-center justify-center gap-3 group active:scale-[0.98] cursor-pointer"
                type="submit"
              >
                <span className="text-sm uppercase tracking-widest">
                  Đăng ký ngay
                </span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Đã là thành viên?{" "}
                <a
                  className="text-[#e69019] hover:text-[#e69019]/80 font-bold ml-1 transition-colors cursor-pointer"
                  onClick={() => navigate(ROUTER_URL.CLIENT_ROUTER.LOGIN)}
                >
                  Đăng nhập ngay
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientRegisterPage;
