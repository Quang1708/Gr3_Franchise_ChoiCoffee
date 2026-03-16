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
  role?: string;
  scope?: "GLOBAL" | "FRANCHISE";
  franchise_id?: string | null;
  franchise_name?: string | null;
  }[];
};

export type FranchiseOption = {
  id: string;
  code: string;
  name: string;
};

export const getAccessibleFranchises = (
  user: any,
  allFranchises: FranchiseOption[],
): FranchiseOption[] => {
  if (!user?.roles?.length) return [];

  const isAdmin = user.roles.some((r: any) => r.role === "ADMIN");

  // 🟢 ADMIN → return full list
  if (isAdmin) {
    return allFranchises;
  }

  // 🟡 MANAGER → only roles franchise
  return user.roles
    .filter((r: any) => r.scope === "FRANCHISE")
    .map((r: any) => ({
      id: r.franchise_id,
      code: r.franchise_name?.split(" ").pop() ?? "",
      name: r.franchise_name ?? "Unnamed Franchise",
    }));
};

export function getEffectivePermissions(
  user: CmsUser | null,
  franchiseId?: string | null,
): PermissionCode[] {
  if (!user?.roles?.length) return [];

  const roleCodes = user.roles
    .filter((r) => {
      if (!r.role) return false;

      /**
       * GLOBAL role chỉ dùng khi KHÔNG có franchise context
       */
      if (!franchiseId && r.scope === "GLOBAL") {
        return true;
      }

      /**
       * FRANCHISE role
       */
      if (franchiseId && r.franchise_id != null) {
        return String(r.franchise_id) === String(franchiseId);
      }

      return false;
    })
    .map((r) => r.role as string);

  const perms = roleCodes.flatMap((code) => ROLE_PERMISSIONS[code] ?? []);

  return Array.from(new Set(perms));
}
export function can(
  user: CmsUser | null,
  perm: PermissionCode,
  franchiseId?: string | null,
) {
  return getEffectivePermissions(user, franchiseId).includes(perm);
}

/**
 * Dùng cho route-level guard khi chưa có franchise context.
 * Nếu user có perm ở BẤT KỲ franchise nào (hoặc global) => true
 */

export function canAny(
  user: CmsUser | null,
  perm: PermissionCode,
  allFranchises: FranchiseOption[] = [],
) {
  if (!user?.roles?.length) return false;

  if (can(user, perm, undefined)) return true;

  const fr = getAccessibleFranchises(user, allFranchises);

  return fr.some((f) => can(user, perm, f.id));
}