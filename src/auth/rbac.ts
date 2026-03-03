import { ROLE_PERMISSIONS } from "./rbac.map";
import type { PermissionCode } from "./rbac.permissions";
import { FRANCHISE_SEED_DATA } from "@/mocks/franchise.seed";

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

export function getAccessibleFranchises(user: CmsUser | null) {
  const list = FRANCHISE_SEED_DATA.filter((f) => !f.isDeleted);
  if (!user?.roles?.length) return [];

  const hasGlobal = user.roles.some(
    (r) => r.scope === "GLOBAL" || r.franchise_id == null,
  );
  if (hasGlobal) return list;

  const allowedIds = new Set(
    user.roles
      .map((r) => r.franchise_id)
      .filter((x): x is string | number =>
        typeof x === "number" || typeof x === "string",
      )
      .map((x) => String(x)),
  );

  return list.filter((f) => allowedIds.has(String(f.id)));
}

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