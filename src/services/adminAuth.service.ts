import { USER_SEED_DATA } from "../mocks/user.seed.ts";
import { USER_FRANCHISE_ROLE_SEED_DATA } from "../mocks/user_franchise_role.seed.ts";
import { ROLE_SEED_DATA } from "../mocks/role.seed.ts";

export type LoginInput = { email: string; password: string };
export type LoginResult =
  | {
      ok: true;
      token: string;
      user: {
        id: number;
        email: string;
        name: string;
        phone: string;
        avatar_url: string | null;
        roles: {
          role_code: string;
          scope: string;
          franchise_id: number | null;
        }[];
      };
    }
  | { ok: false; message: string };

export async function loginAdmin(input: LoginInput): Promise<LoginResult> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 400));

  const user = USER_SEED_DATA.find(
    (u) =>
      u.email.toLowerCase() === input.email.toLowerCase() &&
      !u.isDeleted &&
      u.isActive,
  );

  if (!user) {
    return { ok: false, message: "Email hoặc mật khẩu không đúng!" };
  }

  // Check password (plain text as per seed data)
  if (user.passwordHash !== input.password) {
    return { ok: false, message: "Email hoặc mật khẩu không đúng!" };
  }

  // Check Role
  // Find all roles for this user
  const userRoles = USER_FRANCHISE_ROLE_SEED_DATA.filter(
    (ufr) => ufr.userId === user.id && !ufr.isDeleted,
  );

  // Map to detailed role structure
  const detailedRoles = userRoles
    .map((ufr) => {
      const roleDef = ROLE_SEED_DATA.find((r) => r.id === ufr.roleId);
      if (!roleDef) return null;
      return {
        role_code: roleDef.code,
        scope: roleDef.scope,
        franchise_id: ufr.franchiseId,
      };
    })
    .filter((r) => r !== null) as {
    role_code: string;
    scope: string;
    franchise_id: number | null;
  }[];

  // Allowed roles
  const validRoles = ["ADMIN", "MANAGER", "STAFF"];
  const hasAllowedRole = detailedRoles.some((r) =>
    validRoles.includes(r.role_code),
  );

  if (!hasAllowedRole) {
    return { ok: false, message: "Tài khoản không có quyền truy cập!" };
  }

  // Success
  const token = `demo.${btoa(user.email)}.${Date.now()}`;

  const userWithRole = {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatar_url: user.avatarUrl ?? null,
    roles: detailedRoles,
  };

  return { ok: true, token, user: userWithRole };
}

export async function requestResetPassword(
  email: string,
): Promise<{ ok: true; token: string }> {
  await new Promise((r) => setTimeout(r, 400));
  const token = `reset.${btoa(email)}.${Date.now()}`;
  return { ok: true, token };
}

export async function verifyToken(token: string): Promise<{ ok: boolean }> {
  await new Promise((r) => setTimeout(r, 500));
  if (!token || token.toLowerCase().includes("expired")) return { ok: false };
  return { ok: true };
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ ok: boolean }> {
  await new Promise((r) => setTimeout(r, 500));
  if (!token || newPassword.length < 6) return { ok: false };
  return { ok: true };
}
