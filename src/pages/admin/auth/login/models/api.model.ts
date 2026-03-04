import type { Role, User } from "@/models";

export type AdminLoginRequest = {
  email: User["email"];
  password: string;
};

export type AdminRoleLike = {
  role?: Role["code"];
  role_code?: Role["code"];
  scope?: Role["scope"];
  franchise_id?: string | number | null;
  franchise_name?: string | null;
};

export type AdminLoginUserProfile = {
  id: User["id"] | string;
  email: User["email"];
  phone: User["phone"];
  name: User["name"];
  avatar_url?: string;
  avatarUrl?: User["avatarUrl"];
  roles?: AdminRoleLike[];
};

export type AdminLoginResponse = {
  success: boolean;
  data: {
    user: AdminLoginUserProfile;
    token: string;
    roles?: AdminRoleLike[];
  } | null;
  message?: string;
};

export type AdminProfileResponse = {
  success: boolean;
  data:
    | {
        user: AdminLoginUserProfile;
        roles?: AdminRoleLike[];
        active_context?: {
          role: Role["code"];
          scope: Role["scope"];
          franchiseId: string | number | null;
        };
      }
    | AdminLoginUserProfile
    | null;
  message?: string;
};
