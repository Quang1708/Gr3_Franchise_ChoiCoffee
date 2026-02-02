import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ROUTER_URL from "../../../routes/router.const";
import { SESSION_STORAGE } from "../../../consts/sessionstorage.const";
import {
  getItemInSessionStorage,
  removeItemInSessionStorage,
  setItemInSessionStorage,
} from "../../../utils/sessionStorage.util";
import { verifyToken } from "../../../services/adminAuth.service";

type VerifyStatus = "idle" | "loading" | "success" | "error";
type VerifyType = "verify" | "reset";

function normalizeType(v: string | null): VerifyType {
  const t = (v ?? "verify").toLowerCase().trim();
  return t === "reset" ? "reset" : "verify";
}

const AdminVerifyTokenPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token")?.trim() ?? "";
  const type = normalizeType(params.get("type"));

  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [message, setMessage] = useState("");

  const tokenOk = useMemo(() => token.length >= 10, [token]);
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

      const res = await verifyToken(token);
      if (!res.ok) {
        setStatus("error");
        setMessage("Token đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.");
        return;
      }

      setStatus("success");
      setMessage("Xác thực thành công!");

      if (type === "reset") {
        removeItemInSessionStorage(SESSION_STORAGE.RESET_TOKEN);
        setItemInSessionStorage<string>(SESSION_STORAGE.RESET_TOKEN, token);

        const saved = (
          getItemInSessionStorage<string>(SESSION_STORAGE.RESET_TOKEN) ?? ""
        ).trim();
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
