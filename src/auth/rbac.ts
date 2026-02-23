import { ROLE_PERMISSIONS } from "./rbac.map";
import type { PermissionCode } from "./rbac.permissions";
import { FRANCHISE_SEED_DATA } from "@/mocks/franchise.seed";

export type CmsUser = {
  id: number;
  email: string;
  name: string;
  phone: string;
  avatar_url: string | null;
  roles: {
    role_code: string;
    scope: "GLOBAL" | "FRANCHISE";
    franchise_id: number | null;
  }[];
};

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

export function getAccessibleFranchises(user: CmsUser | null) {
  const list = FRANCHISE_SEED_DATA.filter((f) => !f.isDeleted);
  if (!user) return [];

  const hasGlobal = user.roles.some(
    (r) => r.scope === "GLOBAL" || r.franchise_id == null,
  );
  if (hasGlobal) return list;

  const allowedIds = new Set(
    user.roles
      .map((r) => r.franchise_id)
      .filter((x): x is number => typeof x === "number"),
  );

  return list.filter((f) => allowedIds.has(f.id));
}

export function getEffectivePermissions(
  user: CmsUser | null,
  franchiseId?: number,
): PermissionCode[] {
  if (!user) return [];

  const roleCodes = user.roles
    .filter((r) => {
      // GLOBAL role: franchise_id null or scope GLOBAL
      if (r.scope === "GLOBAL" || r.franchise_id == null) return true;

      // FRANCHISE role: match context franchise
      if (typeof franchiseId === "number") return r.franchise_id === franchiseId;

      // No context: deny franchise-scoped permissions by default
      return false;
    })
    .map((r) => r.role_code);

  const perms = roleCodes.flatMap((code) => ROLE_PERMISSIONS[code] ?? []);
  return uniq(perms);
}

export function can(user: CmsUser | null, perm: PermissionCode, franchiseId?: number) {
  return getEffectivePermissions(user, franchiseId).includes(perm);
}

/**
 * Dùng cho route-level guard khi chưa có franchise context.
 * Nếu user có perm ở BẤT KỲ franchise nào (hoặc global) => true
 */
export function canAny(user: CmsUser | null, perm: PermissionCode) {
  if (!user) return false;

  // Global roles
  if (can(user, perm, undefined)) return true;

  // Any accessible franchise
  const fr = getAccessibleFranchises(user);
  return fr.some((f) => can(user, perm, f.id));
}