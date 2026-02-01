import React, { useEffect, useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ROUTER_URL from "../../../routes/router.const";
import { AdminResetPasswordSchema } from "./login/schema/AdminAuth.schema";
import { ZodError } from "zod";
import { toastSuccess, toastError } from "../../../utils/toast.util"; // ✅ dùng toast bạn đã có

const RESET_TOKEN_KEY = "RESET_TOKEN";

// helper: đọc token session an toàn (hỗ trợ cả JSON stringify và raw string)
function readResetTokenFromSession(): string {
  const raw = sessionStorage.getItem(RESET_TOKEN_KEY);
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "string" ? parsed.trim() : "";
  } catch {
    return raw.trim();
  }
}

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const [params] = useSearchParams();

  // ✅ fallback: nếu user mở thẳng link reset có ?token=...
  const tokenFromUrl = (params.get("token") ?? "").trim();

  // ✅ ưu tiên token trong session
  const tokenFromSession = readResetTokenFromSession();

  // ✅ token cuối cùng để validate
  const token = tokenFromSession || tokenFromUrl;

  // Prototype: đủ dài là OK
  const tokenOk = useMemo(() => token.length >= 10, [token]);

  // ✅ Nếu token nằm trên URL (mở link trực tiếp), ta cất vào session rồi làm sạch URL
  useEffect(() => {
    if (!tokenFromSession && tokenFromUrl.length >= 10) {
      // lưu theo dạng JSON để thống nhất
      sessionStorage.setItem(RESET_TOKEN_KEY, JSON.stringify(tokenFromUrl));
      navigate(ROUTER_URL.ADMIN_ROUTER.RESET_PASSWORD, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Nếu thiếu token thật sự → báo lỗi (không tự xoá lỗi này khi gõ)
  useEffect(() => {
    if (!tokenOk) {
      setSuccess(false);
      setError(
        "Thiếu hoặc token không hợp lệ. Vui lòng yêu cầu gửi lại liên kết.",
      );
    } else {
      setError("");
    }
  }, [tokenOk]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!tokenOk) {
      toastError("Phiên reset không hợp lệ. Vui lòng yêu cầu link mới.");
      return;
    }

    try {
      AdminResetPasswordSchema.parse({ password, confirm });

      setError("");
      setSuccess(true);

      // ✅ Toast chuẩn (không lộ mật khẩu)
      toastSuccess("Đổi mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.");

      // ✅ Token reset dùng 1 lần -> xoá
      sessionStorage.removeItem(RESET_TOKEN_KEY);

      setTimeout(() => {
        navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN, { replace: true });
      }, 1200);
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const msg = err.issues?.[0]?.message || "Có lỗi xảy ra";
        setError(msg);
        toastError(msg);
      } else {
        setError("Có lỗi xảy ra");
        toastError("Có lỗi xảy ra");
      }
      setSuccess(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-col items-center justify-center gap-2 p-10 bg-white shadow-2xl rounded-2xl font-inter border border-gray-100"
      >
        <div className="flex flex-col items-center gap-1 w-full mb-2">
          <h1 className="text-3xl font-extrabold text-black tracking-tight">
            ChoiCoffee
          </h1>
          <span className="text-sm text-gray-700">
            Đặt lại mật khẩu cho tài khoản quản trị
          </span>

          {/* Gợi ý token status (để demo rõ ràng) */}
          <span
            className={`text-xs mt-1 ${tokenOk ? "text-green-600" : "text-red-600"}`}
          >
            {tokenOk ? "Token hợp lệ ✅" : "Token không hợp lệ ❌"}
          </span>
        </div>

        <div className="w-full flex flex-col gap-0.5 mt-0">
          <label
            className="text-xs text-[#8B8E98] font-semibold mb-1"
            htmlFor="password_field"
          >
            Mật khẩu mới
          </label>
          <div className="relative flex items-center w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Lock size={20} color="#222" />
            </span>
            <input
              placeholder="Nhập mật khẩu mới"
              title="Mật khẩu mới"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input_field w-full h-10 pl-10 rounded-lg outline-none border border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-200 bg-gray-50 shadow-sm transition-all text-gray-900 placeholder:text-gray-400 caret-gray-900"
              id="password_field"
              required
              disabled={!tokenOk} // thiếu token thì khóa input luôn cho rõ
            />
          </div>
        </div>

        <div className="w-full flex flex-col gap-0.5 mt-0">
          <label
            className="text-xs text-[#8B8E98] font-semibold mb-1"
            htmlFor="confirm_field"
          >
            Nhập lại mật khẩu
          </label>
          <div className="relative flex items-center w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Lock size={20} color="#222" />
            </span>
            <input
              placeholder="Nhập lại mật khẩu"
              title="Nhập lại mật khẩu"
              name="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input_field w-full h-10 pl-10 rounded-lg outline-none border border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-200 bg-gray-50 shadow-sm transition-all text-gray-900 placeholder:text-gray-400 caret-gray-900"
              id="confirm_field"
              required
              disabled={!tokenOk}
            />
          </div>
        </div>

        <div className="min-h-[20px]">
          {error && (
            <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
          )}
        </div>

        <button
          title="Đặt lại mật khẩu"
          type="submit"
          disabled={!tokenOk || success}
          className={`w-full h-10 border-0 rounded-lg outline-none text-white mt-2 font-semibold shadow-lg transition
            ${!tokenOk || success ? "bg-gray-400 cursor-not-allowed" : "bg-black cursor-pointer hover:bg-gray-800"}`}
        >
          <span>
            {success ? "Đang chuyển về đăng nhập..." : "Đặt lại mật khẩu"}
          </span>
        </button>

        {success && (
          <p className="text-xs text-green-600 mt-2 text-center">
            Mật khẩu đã được thay đổi thành công!
          </p>
        )}

        <div className="w-full flex justify-between items-center mt-2">
          <button
            type="button"
            className="text-xs text-black hover:text-gray-800 cursor-pointer"
            onClick={() => navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN)}
          >
            Về đăng nhập
          </button>

          {!tokenOk && (
            <button
              type="button"
              className="text-xs text-black underline hover:text-gray-800"
              onClick={() => navigate(ROUTER_URL.ADMIN_ROUTER.FORGOT_PASSWORD)}
            >
              Yêu cầu link mới
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
