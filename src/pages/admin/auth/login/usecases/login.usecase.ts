import type {
  AdminLoginRequest,
  AdminLoginUserProfile,
  AdminRoleLike,
} from "../models/api.model";
import type { AxiosError } from "axios";
import { loginAdmin } from "../services/auth01.service";
import { getAdminProfile } from "../services/auth03.service";

type AdminLoginResult = {
  success: boolean;
  user?: AdminLoginUserProfile;
  token?: string;
  message?: string;
};

const normalizeRoles = (roles: unknown) =>
  Array.isArray(roles)
    ? roles.map((r) => {
        if (typeof r !== "object" || r === null) return r;
        const roleLike = r as AdminRoleLike;
        const normalizedRole = roleLike.role ?? roleLike.role_code;
        return {
          ...roleLike,
          role: normalizedRole,
          role_code: normalizedRole,
        };
      })
    : roles;

const buildUser = (data: unknown): AdminLoginUserProfile | null => {
  const user = (data as { user?: AdminLoginUserProfile } | null)?.user ?? data;
  const roles = normalizeRoles((data as { roles?: unknown } | null)?.roles);
  const userRoles = normalizeRoles(
    (user as AdminLoginUserProfile | null)?.roles,
  );

  if (!user) return null;

  const mergedRoles = Array.isArray(roles) ? roles : userRoles;

  return Array.isArray(mergedRoles)
    ? { ...(user as AdminLoginUserProfile), roles: mergedRoles }
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
    return { success: false, message };
  }

  if (result.success && result.data) {
    return {
      success: true,
      user: buildUser(result.data) ?? result.data.user,
      token: result.data.token,
    };
  }

  if (result.success && result.data == null) {
    const profile = await getAdminProfile();
    const user = profile.success ? buildUser(profile.data) : null;

    if (user) {
      return { success: true, user, token: "SESSION" };
    }

    return {
      success: false,
      message: profile.message ?? result.message ?? "Đăng nhập thất bại.",
    };
  }

  return { success: false, message: result.message ?? "Đăng nhập thất bại." };
};
