import { adminAuthMock } from "../mocks/adminAUth.mock";


export type LoginInput = { email: string; password: string };
export type LoginResult =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { ok: true; token: string; user: any }
  | { ok: false; message: string };

export async function loginAdmin(input: LoginInput): Promise<LoginResult> {
  await new Promise((r) => setTimeout(r, 400));
  const u = adminAuthMock.users.find(
    (x) => x.email === input.email && x.password_hash === input.password
  );
  if (!u) return { ok: false, message: "Email hoặc mật khẩu không đúng!" };
  if (u.role !== "admin") return { ok: false, message: "Tài khoản không có quyền admin!" };
  const token = `demo.${btoa(u.email)}.${Date.now()}`;
  return { ok: true, token, user: u };
}

export async function requestResetPassword(email: string): Promise<{ ok: true; token: string }> {
  await new Promise((r) => setTimeout(r, 400));
  const token = `reset.${btoa(email)}.${Date.now()}`;
  return { ok: true, token };
}

export async function verifyToken(token: string): Promise<{ ok: boolean }> {
  await new Promise((r) => setTimeout(r, 500));
  if (!token || token.toLowerCase().includes("expired")) return { ok: false };
  return { ok: true };
}

export async function resetPassword(token: string, newPassword: string): Promise<{ ok: boolean }> {
  await new Promise((r) => setTimeout(r, 500));
  if (!token || newPassword.length < 6) return { ok: false };
  return { ok: true };
}
