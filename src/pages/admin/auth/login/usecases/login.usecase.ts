import type {
  AdminLoginRequest,
  AdminLoginUserProfile,
  AdminRoleLike,
} from "../models/api.model";
import type { AxiosError } from "axios";
import { getAdminProfile, loginAdmin } from "../services/login.service";

type AdminLoginResult = {
  ok: boolean;
  user?: AdminLoginUserProfile;
  token?: string;
  message?: string;
};

const normalizeRoles = (roles: unknown) =>
  Array.isArray(roles)
    ? roles.map((r) =>
        typeof r === "object" && r !== null && "role" in r
          ? { ...(r as AdminRoleLike), role_code: (r as AdminRoleLike).role }
          : r,
      )
    : roles;

const buildUser = (data: unknown): AdminLoginUserProfile | null => {
  const user = (data as { user?: AdminLoginUserProfile } | null)?.user ?? data;
  const roles = normalizeRoles((data as { roles?: unknown } | null)?.roles);

  if (!user) return null;

  return Array.isArray(roles)
    ? { ...(user as AdminLoginUserProfile), roles }
    : (user as AdminLoginUserProfile);
};

export const runAdminLogin = async (
  values: AdminLoginRequest,
): Promise<AdminLoginResult> => {
  let result;
  try {
    result = await loginAdmin(values);
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    const message =
      err.response?.data?.message ?? err.message ?? "Dang nhap that bai.";
    return { ok: false, message };
  }

  if (result.success && result.data) {
    return {
      ok: true,
      user: buildUser(result.data) ?? result.data.user,
      token: result.data.token,
    };
  }

  if (result.success && result.data == null) {
    const profile = await getAdminProfile();
    const user = profile.success ? buildUser(profile.data) : null;

    if (user) {
      return { ok: true, user, token: "SESSION" };
    }

    return {
      ok: false,
      message: profile.message ?? result.message ?? "Đăng nhập thất bại.",
    };
  }

  return { ok: false, message: result.message ?? "Đăng nhập thất bại." };
};
