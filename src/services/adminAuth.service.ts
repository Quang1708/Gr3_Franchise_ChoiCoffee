import { axiosAdminClient } from "@/api/axios.config";
import { FAKE_ADMIN_USERS } from "../mocks/dataUser.const";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResult =
  | { ok: true; user: Record<string, unknown>; token: string }
  | { ok: false; message: string };

export type VerifyTokenResult =
  | { ok: true }
  | { ok: false; message: string };

export type ResetPasswordResult =
  | { ok: true }
  | { ok: false; message: string };

// when the backend is not available we fall back to a very simple mock
const USE_MOCK_ADMIN_API =
  !import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_MOCK_ADMIN_API === "true";

// -----------------------------------------------------------------------------
// helper for delay
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// -----------------------------------------------------------------------------
export async function loginAdmin(
  credentials: LoginRequest,
): Promise<LoginResult> {
  if (USE_MOCK_ADMIN_API) {
    await wait(300);
    const email = credentials.email.trim().toLowerCase();
    const pwd = credentials.password;
    const found = FAKE_ADMIN_USERS.find(
      (u) => (u.email ?? "").trim().toLowerCase() === email && u.password_hash === pwd,
    );

    if (!found) {
      return { ok: false, message: "Email hoặc mật khẩu không đúng" };
    }

    // return minimal user object; real backend would send more
    const user = {
      id: found.id,
      email: found.email,
      name: found.name,
      role: found.role,
    };
    const token = `mock-token.${Date.now()}`;
    return { ok: true, user, token };
  }

  try {
    const { data } = await axiosAdminClient.post<LoginResult>(
      "/admin/auth/login",
      credentials,
    );
    return data;
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ||
      (err as Error)?.message ||
      "Đăng nhập thất bại";
    return { ok: false, message };
  }
}

// -----------------------------------------------------------------------------
export async function verifyToken(
  token: string,
): Promise<VerifyTokenResult> {
  if (USE_MOCK_ADMIN_API) {
    await wait(200);
    if (token && token.length >= 10) {
      return { ok: true };
    }
    return { ok: false, message: "Token không hợp lệ" };
  }

  try {
    const { data } = await axiosAdminClient.post<VerifyTokenResult>(
      "/admin/auth/verify-token",
      { token },
    );
    return data;
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ||
      (err as Error)?.message ||
      "Xác thực token thất bại";
    return { ok: false, message };
  }
}

// -----------------------------------------------------------------------------
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<ResetPasswordResult> {
  if (USE_MOCK_ADMIN_API) {
    await wait(300);
    if (token && token.length >= 10 && newPassword) {
      return { ok: true };
    }
    return { ok: false, message: "Dữ liệu không hợp lệ" };
  }

  try {
    const { data } = await axiosAdminClient.put<ResetPasswordResult>(
      "/admin/auth/reset-password",
      { token, password: newPassword },
    );
    return data;
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ||
      (err as Error)?.message ||
      "Reset mật khẩu thất bại";
    return { ok: false, message };
  }
}
