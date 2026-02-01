import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ROUTER_URL from "../../../routes/router.const";
import { SESSION_STORAGE } from "../../../consts/sessionstorage.const";
import {
  getItemInSessionStorage,
  removeItemInSessionStorage,
  setItemInSessionStorage,
} from "../../../utils/sessionStorage.util";

type VerifyStatus = "idle" | "loading" | "success" | "error";
type VerifyType = "verify" | "reset";

function normalizeType(v: string | null): VerifyType {
  const t = (v ?? "verify").toLowerCase();
  return t === "reset" ? "reset" : "verify";
}

const AdminVerifyTokenPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token")?.trim() ?? "";
  const type = normalizeType(params.get("type"));

  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [message, setMessage] = useState<string>("");

  // Prototype: chỉ cần token đủ dài, không ép JWT
  const tokenOk = useMemo(() => token.length >= 10, [token]);

  // React StrictMode (dev) có thể chạy effect 2 lần -> dùng ref để tránh điều hướng 2 lần
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const run = async () => {
      if (!tokenOk) {
        setStatus("error");
        setMessage(
          "Thiếu hoặc token không hợp lệ. Vui lòng kiểm tra lại link.",
        );
        return;
      }

      setStatus("loading");
      setMessage("Đang xác thực token...");

      try {
        // PROTOTYPE: giả lập call API
        await new Promise((r) => setTimeout(r, 800));

        // giả lập token hết hạn nếu chứa chữ "expired"
        if (token.toLowerCase().includes("expired")) {
          throw new Error("expired");
        }

        setStatus("success");
        setMessage("Xác thực thành công!");

        // Điều hướng theo type
        if (type === "reset") {
          // ✅ Lưu token vào sessionStorage để trang Reset đọc (URL sạch)
          removeItemInSessionStorage(SESSION_STORAGE.RESET_TOKEN);

          // luôn lưu theo util (JSON.stringify)
          setItemInSessionStorage<string>(SESSION_STORAGE.RESET_TOKEN, token);

          // ✅ đọc lại theo util
          const fromUtil = getItemInSessionStorage<string>(
            SESSION_STORAGE.RESET_TOKEN,
          );

          // ✅ fallback đọc raw (trong trường hợp util bị lỗi hoặc dữ liệu cũ)
          const raw = sessionStorage.getItem(SESSION_STORAGE.RESET_TOKEN);

          // normalize: bóc ngoặc kép nếu raw là JSON string
          const normalize = (v: unknown) => {
            if (typeof v !== "string") return "";
            const s = v.trim();
            // nếu s = "\"demo...\"" => JSON.parse sẽ ra "demo..."
            try {
              const parsed = JSON.parse(s);
              return typeof parsed === "string" ? parsed.trim() : s;
            } catch {
              return s;
            }
          };

          const saved = normalize(fromUtil ?? raw ?? "");

          if (!saved || saved !== token) {
            setStatus("error");
            setMessage("Không thể lưu token reset. Vui lòng thử lại.");
            return;
          }

          setTimeout(() => {
            navigate(ROUTER_URL.ADMIN_ROUTER.RESET_PASSWORD, { replace: true });
          }, 700);
        } else {
          setTimeout(() => {
            navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN, { replace: true });
          }, 900);
        }
      } catch {
        setStatus("error");
        setMessage("Token đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.");
      }
    };

    run();
  }, [tokenOk, token, type, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-black">Verify Token</h1>
        <p className="text-sm text-gray-600 mt-1">
          {type === "reset"
            ? "Xác thực yêu cầu đặt lại mật khẩu"
            : "Xác thực tài khoản / đăng ký"}
        </p>

        <div className="mt-2 text-xs">
          <span className={tokenOk ? "text-green-600" : "text-red-600"}>
            {tokenOk ? "Token hợp lệ ✅" : "Token không hợp lệ ❌"}
          </span>
        </div>

        <div className="mt-6 rounded-xl border bg-gray-50 p-4">
          <div className="text-sm">
            <div className="font-semibold">
              Trạng thái:{" "}
              <span
                className={
                  status === "success"
                    ? "text-green-600"
                    : status === "error"
                      ? "text-red-600"
                      : "text-gray-700"
                }
              >
                {status.toUpperCase()}
              </span>
            </div>
            <div className="mt-2 text-gray-700">{message}</div>
          </div>

          {status === "loading" && (
            <div className="mt-3 text-xs text-gray-500">Loading...</div>
          )}
        </div>

        {status === "error" && (
          <div className="mt-6 flex gap-2">
            <button
              className="flex-1 h-10 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition"
              onClick={() => navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN)}
            >
              Về Login
            </button>

            {type === "reset" && (
              <button
                className="flex-1 h-10 rounded-lg border font-semibold hover:bg-gray-50 transition"
                onClick={() =>
                  navigate(ROUTER_URL.ADMIN_ROUTER.FORGOT_PASSWORD)
                }
              >
                Gửi lại yêu cầu
              </button>
            )}
          </div>
        )}

        {status === "success" && (
          <div className="mt-6 text-xs text-gray-500">Đang điều hướng...</div>
        )}
      </div>
    </div>
  );
};

export default AdminVerifyTokenPage;
