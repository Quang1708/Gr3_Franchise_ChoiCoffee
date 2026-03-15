import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ClientForgotPasswordSchema,
  type ClientForgotPasswordSchemaType,
} from "./schema/clientForgotPassword.schema";
import ROUTER_URL from "@/routes/router.const";
import { toastSuccess, toastError } from "@utils/toast.util";
import { forgotPassword } from "../services/customerAuth04.service";
import FormInput from "@/components/Client/Form/FormInput";
import ClientLoading from "@/components/Client/Client.Loading";
import ButtonSubmit from "@/components/Client/Button/ButtonSubmit";

const ClientForgotPasswordPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ClientForgotPasswordSchemaType>({
    resolver: zodResolver(ClientForgotPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const errorMap: Record<string, string> = {
    "Customer does not exist or is not eligible for password reset":
      "Khách hàng không tồn tại hoặc không đủ điều kiện để đặt lại mật khẩu.",
  };

  const onSubmit = async (data: ClientForgotPasswordSchemaType) => {
    setIsLoading(true);

    try {
      await forgotPassword({ email: data.email });
      toastSuccess("Đã gửi liên kết đặt lại mật khẩu tới email của bạn!");
      navigate(ROUTER_URL.CLIENT_ROUTER.LOGIN);
    } catch (error: unknown) {
      const err = error as { message?: string };
      const errorMessage =
        errorMap[err.message || ""] || "Đã có lỗi xảy ra. Vui lòng thử lại.";

      // Set error cho email field
      setError("email", {
        type: "server",
        message: errorMessage,
      });

      toastError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <ClientLoading />}
      <div className="flex h-screen flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Visual Panel */}
        <div className="hidden lg:flex lg:w-2/3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent z-10"></div>
          <div
            className="absolute inset-0 bg-center bg-cover transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBm8Lf1rzrXVnRrHBlLl31oC0T_vE1p4VEkwZmVkHlM6tQe_WfF4iZfw2lYEBMHrg6TJEms3rSKuEibE0DSlnq_fESKh6Pw0GTnC3ujfsZARKWudACWnPbUgu5_5P17Nr-c67ycz0TcgsWPlcv5lBig39rI_PDknrxu1VkIKnJyX4T2frrVGMnTu0rVaAFX6QyYeym1DId7HBtgwQd0PJJenKmOLZAkZHG40-Dd9adGA95bPksBdzuDKCAxpC8m_ybu8nXOGbO9dmOW")',
              filter: "blur(2px)",
            }}
          ></div>
          <div className="relative z-20 flex flex-col justify-end p-16 w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-8 text-primary">
                <svg
                  fill="currentColor"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                ChoiCoffee
              </span>
            </div>
            <h3 className="text-3xl font-bold mb-4 text-white">
              Hệ thống nhượng quyền chuyên nghiệp
            </h3>
            <p className="text-gray-500 text-lg max-w-md">
              Khám phá cơ hội kinh doanh cùng chúng tôi và mang hương vị cà phê
              tuyệt hảo đến mọi nơi.
            </p>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 bg-white">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center gap-3 mb-12">
              <div className="size-6 text-primary">
                <svg
                  fill="currentColor"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                ChoiCoffee
              </span>
            </div>

            <div className="flex flex-col gap-2 mb-10">
              <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 sm:text-4xl">
                Quên mật khẩu
              </h1>
              <p className="text-gray-600 text-base">
                Nhập email đã đăng ký của bạn. Chúng tôi sẽ gửi một liên kết để
                đặt lại mật khẩu.
              </p>
            </div>

            <form
              className="flex flex-col gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Email Input */}
              <FormInput
                label="Email"
                type="email"
                placeholder="example@choicoffee.vn"
                error={errors.email}
                register={register("email")}
                labelClassName="text-sm font-medium text-slate-900 px-1 mb-2 block"
                inputClassName="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-xl text-slate-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all outline-none"
              />

              {/* Submit Button */}
              <ButtonSubmit label="Gửi yêu cầu" icon="arrow_forward" />
            </form>

            <div className="mt-10 flex flex-col gap-4">
              <a
                className="group flex items-center justify-center gap-2 text-gray-600 hover:text-slate-900 transition-colors py-2 cursor-pointer"
                onClick={() => navigate(ROUTER_URL.CLIENT_ROUTER.LOGIN)}
              >
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
                <span className="text-sm font-medium underline underline-offset-4 decoration-gray-300">
                  Quay lại đăng nhập
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientForgotPasswordPage;
