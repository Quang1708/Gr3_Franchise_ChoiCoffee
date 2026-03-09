/* eslint-disable @typescript-eslint/no-explicit-any */
import { ROLE_PERMISSIONS } from "./rbac.map";
import type { PermissionCode } from "./rbac.permissions";


export type CmsUser = {
  id: string | number;
  email: string;
  name: string;
  phone: string;
  avatar_url?: string | null;
  roles?: {
    role_code?: string;
    scope?: "GLOBAL" | "FRANCHISE";
    franchise_id?: string | number | null;
  }[];
};

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

export type FranchiseOption = {
  id: string;
  name: string;
  code?: string;
};

export const getAccessibleFranchises = (user: any): FranchiseOption[] => {
  if (!user?.roles?.length) return [];

  const isAdmin = user.roles.some((r: any) => r.role === "ADMIN");

  // 🟢 ADMIN → return tất cả franchise (từ API hoặc store)
  if (isAdmin) {
    return user.allFranchises ?? [];
  }

  // 🟡 MANAGER → chỉ return franchise trong roles
  return user.roles
    .filter((r: any) => r.scope === "FRANCHISE")
    .map((r: any) => ({
      id: r.franchise_id,
      name: r.franchise_name ?? "Unnamed Franchise",
      code: r.franchise_name?.split(" ").pop() ?? "",
    }));
};

export function getEffectivePermissions(
  user: CmsUser | null,
  franchiseId?: string | number,
): PermissionCode[] {
  if (!user?.roles?.length) return [];

  const roleCodes = user.roles
    .filter((r) => {
      if (!r.role_code) return false;
      // GLOBAL role: franchise_id null or scope GLOBAL
      if (r.scope === "GLOBAL" || r.franchise_id == null) return true;

      // FRANCHISE role: match context franchise
      if (typeof franchiseId === "number" || typeof franchiseId === "string") {
        return String(r.franchise_id) === String(franchiseId);
      }

      // No context: deny franchise-scoped permissions by default
      return false;
    })
    .map((r) => r.role_code as string);

  const perms = roleCodes.flatMap((code) => ROLE_PERMISSIONS[code] ?? []);
  return uniq(perms);
}

export function can(
  user: CmsUser | null,
  perm: PermissionCode,
  franchiseId?: string | number,
) {
  return getEffectivePermissions(user, franchiseId).includes(perm);
}

/**
 * Dùng cho route-level guard khi chưa có franchise context.
 * Nếu user có perm ở BẤT KỲ franchise nào (hoặc global) => true
 */
export function canAny(user: CmsUser | null, perm: PermissionCode) {
  if (!user?.roles?.length) return false;

  // Global roles
  if (can(user, perm, undefined)) return true;

  // Any accessible franchise
  const fr = getAccessibleFranchises(user);
  return fr.some((f) => can(user, perm, f.id));
}