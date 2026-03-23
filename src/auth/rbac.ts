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
  role_code?: string;
  scope?: "GLOBAL" | "FRANCHISE";
  franchise_id?: string | null;
  franchiseId?: string | null;
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

  const isAdmin = user.roles.some(
    (r: any) => (r.role ?? r.role_code) === "ADMIN",
  );

  // 🟢 ADMIN → return full list
  if (isAdmin) {
    return allFranchises;
  }

  // 🟡 MANAGER → only roles franchise
  return user.roles
    .filter((r: any) => r.scope === "FRANCHISE")
    .map((r: any) => ({
      id: String(r.franchise_id ?? r.franchiseId ?? ""),
      code: r.franchise_name?.split(" ").pop() ?? "",
      name: r.franchise_name ?? "Unnamed Franchise",
    }))
    .filter((f: FranchiseOption) => f.id !== "");
};

export function getEffectivePermissions(
  user: CmsUser | null,
  franchiseId?: string | null,
): PermissionCode[] {
  if (!user?.roles?.length) return [];

  const normalizedFranchiseId =
    franchiseId == null || franchiseId === "" ? null : String(franchiseId);

  const roleCodes = user.roles
    .filter((r) => {
      const roleCode = (r.role ?? r.role_code) as string | undefined;
      if (!roleCode) return false;

      // GLOBAL roles apply in all contexts.
      if (r.scope === "GLOBAL") {
        return true;
      }

      /**
       * FRANCHISE role
       */
      const roleFranchiseId = r.franchise_id ?? (r as any).franchiseId;
      if (franchiseId && roleFranchiseId != null) {
        return String(roleFranchiseId) === String(franchiseId);
      }

      return false;
    })
    .map((r) => (r.role ?? r.role_code) as string);

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

  // Role-level shortcut for route guard (không phụ thuộc context hiện tại)
  const hasRolePermission = user.roles.some((r) => {
    const roleCode = (r.role ?? r.role_code) as string | undefined;
    if (!roleCode) return false;
    return (ROLE_PERMISSIONS[roleCode] ?? []).includes(perm);
  });
  if (hasRolePermission) return true;

  if (can(user, perm, undefined)) return true;

  const roleFranchises = user.roles
    .filter((r) => r.scope === "FRANCHISE")
    .map((r) => r.franchise_id ?? r.franchiseId)
    .filter((id): id is string => !!id)
    .map((id) => ({ id: String(id), code: "", name: "" }));
  const fr = roleFranchises.length > 0
    ? roleFranchises
    : getAccessibleFranchises(user, allFranchises);

  return fr.some((f) => can(user, perm, f.id));
}
