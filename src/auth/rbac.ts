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

  const normalizedFranchiseId =
    franchiseId == null || franchiseId === "" ? null : String(franchiseId);

  const roleCodes = user.roles
    .filter((r) => {
      if (!r.role) return false;

      // GLOBAL roles apply in all contexts.
      if (r.scope === "GLOBAL") {
        return true;
      }

      // FRANCHISE role only applies when a franchise is selected.
      if (normalizedFranchiseId !== null && r.scope === "FRANCHISE") {
        return String(r.franchise_id) === normalizedFranchiseId;
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
