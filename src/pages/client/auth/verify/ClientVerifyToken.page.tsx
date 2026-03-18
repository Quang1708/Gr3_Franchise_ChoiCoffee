import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ROUTER_URL from "@/routes/router.const";
import { toastSuccess } from "@utils/toast.util";
import { verifyToken, resendToken } from "../services";
import {
  ClientResendTokenSchema,
  type ClientResendTokenSchemaType,
} from "./schema/clientVerifyToken.schema";
import ClientLoading from "@/components/Client/Client.Loading";

const ClientVerifyTokenPage: React.FC = () => {
  const navigate = useNavigate();
  const { token: urlToken } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors: formErrors },
  } = useForm<ClientResendTokenSchemaType>({
    resolver: zodResolver(ClientResendTokenSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const [error, setError] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifySuccess, setVerifySuccess] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [resendStatus, setResendStatus] = useState<"success" | "error" | null>(
    null,
  );
  const [resendMessage, setResendMessage] = useState<string>("");
  const hasAttemptedVerify = useRef(false);

  const canResend = timeLeft <= 0;

  // Auto-verify when token is present in URL
  useEffect(() => {
    const tokenFromUrl = urlToken || searchParams.get("token");
    if (tokenFromUrl && !hasAttemptedVerify.current) {
      hasAttemptedVerify.current = true;
      const autoVerify = async () => {
        setIsVerifying(true);
        try {
          await verifyToken({ token: tokenFromUrl });
          setVerifySuccess(true);
          toastSuccess("Xác thực thành công!");
          setTimeout(() => {
            navigate(ROUTER_URL.CLIENT_ROUTER.LOGIN);
          }, 2000);
        } catch (error: unknown) {
          setIsVerifying(false);
          const err = error as { response?: { data?: { message?: string } } };
          setError(
            err?.response?.data?.message ||
              "Mã xác thực không đúng hoặc đã hết hạn!",
          );
        }
      };
      autoVerify();
    }
  }, [urlToken, searchParams, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const onSubmit = async (data: ClientResendTokenSchemaType) => {
    if (!canResend) return;

    setIsResending(true);
    try {
      await resendToken({ email: data.email });
      setResendStatus("success");
      setResendMessage(
        "Link xác thực mới đã được gửi! Vui lòng kiểm tra email.",
      );
      setTimeLeft(300);
      setError("");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setResendStatus("error");
      setResendMessage(
        err?.response?.data?.message ||
          "Không thể gửi lại token. Vui lòng thử lại sau!",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      {(isVerifying || isResending) && <ClientLoading />}
      <div className="flex h-screen flex-col lg:flex-row bg-background-light overflow-hidden">
        {/* Left Side: Brand */}
        <div className="hidden lg:flex lg:w-2/3 relative overflow-hidden bg-charcoal">
          <div className="absolute inset-0 z-10 bg-linear-to-t from-charcoal via-charcoal/20 to-transparent"></div>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB0fMyP7IZXei56k4m39rPeldibnoQ1JWuKKYmscjjhY3BoO46PKSWjzSHJz-mxarPu_cBQWBjv-dwdJDYYKHN29-llx50HtjcE-QMflDfQ0xG7_1BmPjPAnKD0KqD_aPQz1uomzldVnZZNKTFWA9rgO5WBVh48DdHqpKxY5sJoYE4FJNCl-qIAIYkLTpIYPVC-79ectlWuBBPM0Q9-2GvKC_1Q2woN7AQxX-kzJnYRbQ2ZFUhJCz0Hvto7jQ7Kgx4hTFVSuwJCCby1')",
            }}
          ></div>
          <div className="relative z-20 flex flex-col justify-between p-16 w-full h-full">
            <div className="flex items-center gap-4">
              <div className="size-8 text-primary">
                <svg
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
              <h2 className="text-2xl font-bold leading-tight tracking-tight text-white">
                ChoiCoffee
              </h2>
            </div>
            <div className="max-w-md">
              <h1 className="text-4xl font-bold text-white mb-6">
                Đối tác Nhượng quyền
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed">
                Hành trình mang hương vị cafe Việt nguyên bản đến mọi nẻo đường
                bắt đầu từ đây. Vui lòng xác thực danh tính để tiếp tục.
              </p>
            </div>
            <div className="flex gap-4 text-slate-400 text-sm">
              <a className="hover:text-primary transition-colors" href="/about">
                Về chúng tôi
              </a>
              <span>•</span>
              <a
                className="hover:text-primary transition-colors"
                href="/contact"
              >
                Liên hệ
              </a>
            </div>
          </div>
        </div>

        {/* Right Side: Verify Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-background-light">
          <div className="w-full max-w-120">
            {/* Verification Card Content */}
            <div className="flex flex-col items-center text-center mb-10">
              <div className="mb-8 p-6 bg-primary/10 rounded-full">
                <span className="material-symbols-outlined text-primary text-6xl">
                  {isVerifying
                    ? "hourglass_empty"
                    : verifySuccess
                      ? "check_circle"
                      : error
                        ? "error"
                        : "mark_email_unread"}
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-3 tracking-tight text-slate-900">
                {isVerifying
                  ? "Đang xác thực..."
                  : verifySuccess
                    ? "Xác thực thành công!"
                    : error
                      ? "Xác thực thất bại"
                      : "Xác thực Token"}
              </h2>
              <p className="text-slate-500 max-w-[320px]">
                {isVerifying
                  ? "Vui lòng đợi trong giây lát..."
                  : verifySuccess
                    ? "Tài khoản của bạn đã được xác thực. Đang chuyển đến trang đăng nhập..."
                    : error
                      ? "Có lỗi xảy ra khi xác thực. Vui lòng nhập email để nhận lại link xác thực."
                      : "Vui lòng nhập email để nhận lại link xác thực"}
              </p>
            </div>

            {/* Only show resend form when not verifying and not successful */}
            {!isVerifying && !verifySuccess && (
              <div className="bg-white p-8 rounded-xl shadow-xl border border-slate-200">
                {/* Show resend status message if exists */}
                {resendStatus ? (
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className={`w-full p-4 rounded-lg text-center ${
                        resendStatus === "success"
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <p
                        className={`font-medium ${
                          resendStatus === "success"
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {resendMessage}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setResendStatus(null);
                        setResendMessage("");
                      }}
                      className="text-primary font-medium text-sm hover:underline cursor-pointer"
                    >
                      Gửi lại email khác
                    </button>
                  </div>
                ) : (
                  // Show resend form
                  <form
                    onSubmit={handleFormSubmit(onSubmit)}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="w-full mb-4">
                      <label
                        htmlFor="resend-email"
                        className="block text-sm font-medium text-slate-700 mb-2"
                      >
                        Email để gửi lại link xác thực
                      </label>
                      <input
                        id="resend-email"
                        type="email"
                        {...register("email")}
                        placeholder="Nhập email của bạn"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 placeholder:text-slate-400"
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-slate-500 text-sm">
                          Chưa nhận được email xác thực?
                        </p>
                        <button
                          type="submit"
                          disabled={!canResend}
                          className="text-primary font-bold text-sm hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Gửi lại
                        </button>
                      </div>
                      {!canResend && (
                        <p className="text-slate-400 text-xs">
                          Vui lòng đợi {Math.floor(timeLeft / 60)}:
                          {String(timeLeft % 60).padStart(2, "0")} để gửi lại
                        </p>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Show error details if verification failed */}
            {error && !isVerifying && (
              <div className="bg-white p-6 rounded-xl shadow-xl border border-red-200 mb-6">
                <p className="text-red-600 text-center mb-4">{error}</p>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="mt-8 flex justify-center">
              <a
                className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium cursor-pointer"
                onClick={() => navigate(ROUTER_URL.CLIENT_ROUTER.LOGIN)}
              >
                <span className="material-symbols-outlined text-lg">
                  arrow_back
                </span>
                Quay lại đăng nhập
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientVerifyTokenPage;
