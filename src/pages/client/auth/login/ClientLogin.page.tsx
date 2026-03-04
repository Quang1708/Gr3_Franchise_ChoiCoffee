import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ClientLoginSchema,
  type ClientLoginSchemaType,
} from "./schema/clientLogin.schema";
import ROUTER_URL from "@/routes/router.const";
import { toastSuccess, toastError } from "@/utils/toast.util";
import { customerLogin } from "../services/authApi";
import { getCustomerInfo } from "../../account/partial/service/api";
import ButtonSubmit from "@/components/Client/Button/ButtonSubmit";
import ClientLoading from "@/components/Client/Client.Loading";
import FormInput from "@/components/Client/Form/FormInput";

const ClientLoginPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ClientLoginSchemaType>({
    resolver: zodResolver(ClientLoginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const errorMap: Record<string, string> = {
    "Password incorrect": "Sai mật khẩu!",
    "Email does not exist or is not eligible for login":
      "Email không tồn tại hoặc không đủ điều kiện để đăng nhập.",
  };

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: ClientLoginSchemaType) => {
    setIsLoading(true);

    try {
      const loginResponse = await customerLogin({
        email: data.email,
        password: data.password,
      });

      // Check if login was successful
      if (loginResponse.success) {
        // Fetch customer info and store in localStorage
        try {
          const customerInfo = await getCustomerInfo();
          localStorage.setItem("customer_info", JSON.stringify(customerInfo));
        } catch (error) {
          console.error("Failed to fetch customer info:", error);
        }

        toastSuccess("Đăng nhập thành công!");
        navigate(ROUTER_URL.HOME);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      const errorMessage =
        errorMap[err?.message || ""] || "Đăng nhập thất bại. Vui lòng thử lại.";

      // Set error cho field tương ứng dựa vào message
      if (err?.message === "Password incorrect") {
        setError("password", {
          type: "server",
          message: errorMap["Password incorrect"],
        });
      } else if (
        err?.message === "Email does not exist or is not eligible for login"
      ) {
        setError("email", {
          type: "server",
          message:
            errorMap["Email does not exist or is not eligible for login"],
        });
      } else {
        // Mặc định set error cho password
        setError("password", {
          type: "server",
          message: errorMessage,
        });
      }

      toastError(errorMessage);
      console.log(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <ClientLoading />}
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
            <form
              noValidate
              className="space-y-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Email */}
              <FormInput
                label="Email"
                type="email"
                placeholder="partner@example.com"
                error={errors.email}
                register={register("email")}
              />

              {/* Password */}
              <div>
                <FormInput
                  label="Mật khẩu"
                  type="password"
                  placeholder="Password"
                  error={errors.password}
                  register={register("password")}
                  showPasswordToggle={true}
                />
                <div className="flex justify-end mt-2">
                  <a
                    className="text-xs font-bold text-primary hover:text-wood-brown transition-colors cursor-pointer"
                    onClick={() =>
                      navigate(ROUTER_URL.CLIENT_ROUTER.FORGOT_PASSWORD)
                    }
                  >
                    Quên mật khẩu?
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <ButtonSubmit label="Đăng nhập" icon="arrow_forward" />
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
    </>
  );
};

export default ClientLoginPage;
