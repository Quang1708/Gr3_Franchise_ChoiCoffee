import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ROUTER_URL from "@/routes/router.const";
import { verifyToken } from "@/pages/admin/auth/login/services/auth08.service";
import { getErrorMessage } from "@/pages/admin/auth/login/services/auth.util";
import { AdminVerifyTokenLabels } from "../schema/AdminVerifyToken.schema";
import ClientLoading from "@/components/Client/Client.Loading";

type VerifyStatus = "idle" | "loading" | "success" | "error";
type VerifyType = "verify" | "reset";

function normalizeType(v: string | null): VerifyType {
  const t = (v ?? "verify").toLowerCase().trim();
  return t === "reset" ? "reset" : "verify";
}

const AdminVerifyTokenPage: React.FC = () => {
  const [params] = useSearchParams();
  const routeParams = useParams();
  const navigate = useNavigate();

  const tokenFromPath = routeParams.token?.trim() ?? "";
  const tokenFromQuery = params.get("token")?.trim() ?? "";
  const token = tokenFromPath || tokenFromQuery;
  const type = normalizeType(params.get("type"));

  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [message, setMessage] = useState("");
  const [redirectSeconds, setRedirectSeconds] = useState<number | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const tokenOk = useMemo(() => token.length >= 10, [token]);
  const ranRef = useRef(false);
  const redirectIntervalRef = useRef<number | null>(null);
  const redirectTimeoutRef = useRef<number | null>(null);

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
        const res = await verifyToken(token);

        if (!res?.success) {
          setStatus("error");
          setMessage(res?.message || "Token không hợp lệ.");
          return;
        }

        setStatus("success");
        setMessage(
          type === "reset"
            ? "Xác thực thành công. Đang chuyển đến trang nhập email."
            : "Xác thực thành công. Đang chuyển đến trang nhập email...",
        );

        setIsRedirecting(true);
        setRedirectSeconds(5);

        if (redirectIntervalRef.current) {
          window.clearInterval(redirectIntervalRef.current);
        }
        if (redirectTimeoutRef.current) {
          window.clearTimeout(redirectTimeoutRef.current);
        }

        redirectIntervalRef.current = window.setInterval(() => {
          setRedirectSeconds((prev) => (prev && prev > 1 ? prev - 1 : null));
        }, 1000);

        redirectTimeoutRef.current = window.setTimeout(() => {
          navigate(ROUTER_URL.ADMIN_ROUTER.REQUEST_NEW_PASSWORD, {
            replace: true,
          });
        }, 5000);
      } catch (error) {
        setStatus("error");
        setMessage(getErrorMessage(error));
      }
    };

    run();
  }, [tokenOk, token, type, navigate]);

  useEffect(() => {
    return () => {
      if (redirectIntervalRef.current) {
        window.clearInterval(redirectIntervalRef.current);
      }
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const statusTitle =
    AdminVerifyTokenLabels.statusTitle[status] ??
    AdminVerifyTokenLabels.statusTitle.idle;

  const tokenStatus =
    status === "success"
      ? "valid"
      : status === "error"
        ? "invalid"
        : status === "loading"
          ? "checking"
          : tokenOk
            ? "valid"
            : "invalid";
  const tokenStatusLabel =
    tokenStatus === "valid"
      ? AdminVerifyTokenLabels.validToken
      : tokenStatus === "invalid"
        ? AdminVerifyTokenLabels.invalidToken
        : "Đang kiểm tra token";
  const tokenStatusBadgeClass =
    tokenStatus === "valid"
      ? "bg-emerald-400/20 text-emerald-200"
      : tokenStatus === "invalid"
        ? "bg-orange-400/20 text-orange-200"
        : "bg-slate-200/10 text-slate-200";
  const tokenStatusBadgeText =
    tokenStatus === "valid"
      ? "Hợp lệ"
      : tokenStatus === "invalid"
        ? "Không hợp lệ"
        : "Đang kiểm tra";

  return (
    <div className="min-h-screen bg-[radial-gradient(70%_70%_at_50%_0%,#fff3e6_0%,#f7f7f5_55%,#eef2f7_100%)] px-4">
      {(status === "loading" || isRedirecting) && <ClientLoading />}
      <div className="mx-auto flex min-h-screen max-w-5xl items-center py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl bg-charcoal px-7 py-8 text-white shadow-2xl sm:px-10">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                <span className="text-lg font-bold">C</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  CHOICOFFEE
                </h1>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">
                  Xác thực quản trị
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <h2 className="text-3xl font-semibold leading-tight">
                  {type === "reset"
                    ? "Xác thực yêu cầu đặt lại mật khẩu"
                    : "Xác thực tài khoản"}
                </h2>
                <p className="mt-3 text-sm text-slate-200">
                  {type === "reset"
                    ? "Kiểm tra token trước khi bạn đăng nhập lại để quản lý hệ thống."
                    : "Tài khoản cần được xác thực để kích hoạt quyền truy cập."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-300">
                  Trạng thái token
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-slate-100">
                    {tokenStatusLabel}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${tokenStatusBadgeClass}`}
                  >
                    {tokenStatusBadgeText}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white/90 p-7 shadow-xl backdrop-blur sm:p-9">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Xác thực
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  {statusTitle}
                </h3>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-sm text-primary">{message}</p>
              {status === "loading" && (
                <p className="mt-2 text-xs text-slate-500">
                  Đang xử lý, vui lòng đợi trong giây lát...
                </p>
              )}
            </div>

            {status === "success" && (
              <div className="mt-6">
                <button
                  className="h-11 w-full rounded-xl bg-primary text-sm font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-[#d48315] cursor-pointer"
                  onClick={() =>
                    navigate(ROUTER_URL.ADMIN_ROUTER.REQUEST_NEW_PASSWORD)
                  }
                >
                  Nhập email nhận mật khẩu
                </button>
                <p className="mt-3 text-center text-xs text-slate-500">
                  {redirectSeconds
                    ? `Tự động chuyển sau ${redirectSeconds}s.`
                    : "Đang chuyển trang..."}
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="mt-6 grid gap-3">
                <button
                  className="h-11 w-full rounded-xl bg-primary text-sm font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-[#d48315] cursor-pointer"
                  onClick={() => navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN)}
                >
                  Về đăng nhập
                </button>
                <button
                  className="h-11 w-full rounded-xl border border-slate-200 text-sm font-semibold uppercase tracking-wide text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                  onClick={() =>
                    navigate(ROUTER_URL.ADMIN_ROUTER.FORGOT_PASSWORD)
                  }
                >
                  {type === "reset" ? "Gửi lại yêu cầu" : "Quên mật khẩu"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVerifyTokenPage;
