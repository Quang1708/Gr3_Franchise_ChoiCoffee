import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClientVerifyTokenSchema } from "./schema/clientVerifyToken.schema";
import ROUTER_URL from "@/routes/router.const";
import { toastSuccess } from "@utils/toast.util";

const ClientVerifyTokenPage: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút = 300 giây
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const canResend = timeLeft <= 0;

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

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, idx) => {
      if (idx < 6) newOtp[idx] = char;
    });
    setOtp(newOtp);

    // Focus last filled input or first empty
    const lastFilledIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");

    const result = ClientVerifyTokenSchema.safeParse({ otp: otpString });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setError("");

    // Mock verification
    console.log("Verifying OTP:", otpString);
    toastSuccess("Xác thực thành công!");
    setTimeout(() => {
      navigate(ROUTER_URL.CLIENT_ROUTER.LOGIN);
    }, 1500);
  };

  const handleResend = () => {
    if (!canResend) return;

    // Mock resend
    console.log("Resending OTP...");
    toastSuccess("Mã OTP mới đã được gửi!");
    setTimeLeft(300);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    inputRefs.current[0]?.focus();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
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
            <a className="hover:text-primary transition-colors" href="/contact">
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
                mark_email_unread
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-3 tracking-tight text-slate-900">
              Xác thực OTP
            </h2>
            <p className="text-slate-500 max-w-[320px]">
              Mã xác thực gồm 6 chữ số đã được gửi tới email{" "}
              <span className="text-slate-900 font-semibold">
                example@choicoffee.vn
              </span>
            </p>
          </div>

          {/* OTP Input Area */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white p-8 rounded-xl shadow-xl border border-slate-200">
              <div className="flex justify-center mb-8">
                <fieldset className="relative flex gap-3 sm:gap-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      className="flex h-14 w-10 sm:w-12 text-center focus:outline-0 focus:ring-0 border-0 border-b-2 border-slate-300 focus:border-primary text-2xl font-bold bg-transparent transition-all text-slate-900"
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                    />
                  ))}
                </fieldset>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center mb-4">{error}</p>
              )}

              <button
                type="submit"
                className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-background-dark text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors mb-6 shadow-lg shadow-primary/20 cursor-pointer"
              >
                <span className="truncate">Xác thực ngay</span>
              </button>

              {/* Timer Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-slate-500 text-sm">
                    Bạn chưa nhận được mã?
                  </p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={!canResend}
                    className="text-primary font-bold text-sm hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Gửi lại mã
                  </button>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex h-10 w-12 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
                      <p className="text-primary text-base font-bold">
                        {String(minutes).padStart(2, "0")}
                      </p>
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      Phút
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex h-10 w-12 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
                      <p className="text-primary text-base font-bold">
                        {String(seconds).padStart(2, "0")}
                      </p>
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      Giây
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>

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
  );
};

export default ClientVerifyTokenPage;
