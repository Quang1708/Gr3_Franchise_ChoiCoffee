import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ClientRegisterSchema,
  type ClientRegisterSchemaType,
} from "./schema/clientRegister.schema";
import ROUTER_URL from "@/routes/router.const";
import { toastSuccess, toastError } from "@utils/toast.util";
import { customerRegister } from "../services/authApi";
import ClientLoading from "@/components/Client/Client.Loading";
import ButtonSubmit from "@/components/Client/Button/ButtonSubmit";

const ClientRegisterPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientRegisterSchemaType>({
    resolver: zodResolver(ClientRegisterSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: ClientRegisterSchemaType) => {
    setIsLoading(true);
    try {
      await customerRegister({
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
        address: data.address,
        avatar_url: data.avatar_url || "https://picsum.photos/200",
      });

      toastSuccess(
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
      );

      // Reset form after successful registration
      reset();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toastError(
        err?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!",
      );
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <ClientLoading />}
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
                Tham gia hệ sinh thái cà phê chất lượng cao cùng ChoiCoffee.
                Chúng tôi cung cấp giải pháp vận hành chuyên nghiệp và nguồn
                cung ổn định cho sự phát triển của bạn.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Register Form */}
        <div className="w-full lg:w-1/3 flex items-center justify-center p-6 sm:p-8 lg:p-10 bg-white overflow-y-auto">
          <div className="w-full max-w-lg my-auto">
            {/* Logo - Mobile */}
            <div className="mb-8 lg:hidden flex items-center gap-3">
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
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Đăng ký tài khoản
              </h1>
              <p className="text-gray-600 text-sm text-left">
                Điền thông tin bên dưới để được chuyên viên tư vấn hỗ trợ sớm
                nhất.
              </p>
            </div>

            {/* Form */}
            <form
              noValidate
              className="space-y-1"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Email */}
              <div className="mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative group">
                  <input
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-slate-900 focus:ring-1 focus:ring-[#e69019] focus:border-[#e69019] outline-none transition-all placeholder:text-gray-400"
                    placeholder="partner@choicoffee.vn"
                    type="email"
                    {...register("email")}
                  />
                </div>
                <div className="min-h-[18px] mt-1">
                  {errors.email && (
                    <span className="text-xs text-red-500 ml-1 block">
                      {errors.email.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative group">
                  <input
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-slate-900 focus:ring-1 focus:ring-[#e69019] focus:border-[#e69019] outline-none transition-all placeholder:text-gray-400"
                    placeholder="Nhập mật khẩu của bạn"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                  />
                  <span
                    className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-[20px] group-focus-within:text-[#e69019] transition-colors cursor-pointer hover:text-[#e69019]"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </div>
                <div className="min-h-[18px] mt-1">
                  {errors.password && (
                    <span className="text-xs text-red-500 ml-1 block">
                      {errors.password.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-gray-700 mb-2">
                  Xác nhận mật khẩu
                </label>
                <div className="relative group">
                  <input
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-slate-900 focus:ring-1 focus:ring-[#e69019] focus:border-[#e69019] outline-none transition-all placeholder:text-gray-400"
                    placeholder="Nhập lại mật khẩu"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                  />
                  <span
                    className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-[20px] group-focus-within:text-[#e69019] transition-colors cursor-pointer hover:text-[#e69019]"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "visibility" : "visibility_off"}
                  </span>
                </div>
                <div className="min-h-[18px] mt-1">
                  {errors.confirmPassword && (
                    <span className="text-xs text-red-500 ml-1 block">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Full Name */}
              <div className="mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-gray-700 mb-2">
                  Họ và tên
                </label>
                <div className="relative group">
                  <input
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-slate-900 focus:ring-1 focus:ring-[#e69019] focus:border-[#e69019] outline-none transition-all placeholder:text-gray-400"
                    placeholder="Họ và tên đầy đủ của bạn"
                    type="text"
                    {...register("name")}
                  />
                </div>
                <div className="min-h-[18px] mt-1">
                  {errors.name && (
                    <span className="text-xs text-red-500 ml-1 block">
                      {errors.name.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <div className="relative group">
                  <input
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-slate-900 focus:ring-1 focus:ring-[#e69019] focus:border-[#e69019] outline-none transition-all placeholder:text-gray-400"
                    placeholder="09xx xxx xxx"
                    type="tel"
                    {...register("phone")}
                  />
                </div>
                <div className="min-h-[18px] mt-1">
                  {errors.phone && (
                    <span className="text-xs text-red-500 ml-1 block">
                      {errors.phone.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <div className="relative group">
                  <input
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-slate-900 focus:ring-1 focus:ring-[#e69019] focus:border-[#e69019] outline-none transition-all placeholder:text-gray-400"
                    placeholder="Địa chỉ của bạn"
                    type="text"
                    {...register("address")}
                  />
                </div>
                <div className="min-h-[18px] mt-1">
                  {errors.address && (
                    <span className="text-xs text-red-500 ml-1 block">
                      {errors.address.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 pb-2">
                <ButtonSubmit label="Đăng ký ngay" icon="arrow_forward" />
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
    </>
  );
};

export default ClientRegisterPage;
