import { can } from "@/auth/rbac";
import { PERM } from "@/auth/rbac.permissions";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { useAuthStore } from "@/stores/auth.store";
import { useMemo } from "react";

export const useShiftPageScope = () => {
  const user = useAuthStore((s) => s.user);
  const selectedFranchiseId = useAdminContextStore(
    (s) => s.selectedFranchiseId,
  );

  const roleCodes = useMemo(
    () =>
      (user?.roles ?? [])
        .map((role) => String(role.role ?? role.role_code ?? "").toUpperCase())
        .filter(Boolean),
    [user?.roles],
  );

  const isAdmin = roleCodes.includes("ADMIN");
  const isManager = !isAdmin && roleCodes.includes("MANAGER");
  const isStaff = !isAdmin && !isManager && roleCodes.includes("STAFF");
  const currentUserId = String(user?.id ?? "").trim();

  const roleFranchiseIds = useMemo(
    () =>
      Array.from(
        new Set(
          (user?.roles ?? [])
            .map((role) => String(role.franchise_id ?? "").trim())
            .filter(Boolean),
        ),
      ),
    [user?.roles],
  );

  const effectiveFranchiseId = useMemo(() => {
    const selected = String(selectedFranchiseId ?? "").trim();
    if (isAdmin) return selected;
    if (selected && roleFranchiseIds.includes(selected)) return selected;
    return roleFranchiseIds[0] ?? selected;
  }, [isAdmin, roleFranchiseIds, selectedFranchiseId]);

  const franchiseId = effectiveFranchiseId;
  const isGlobalContext = isAdmin && selectedFranchiseId === null;
  const showShiftFranchiseLabel = isAdmin && isGlobalContext;

  const canShiftRead = useMemo(
    () => can(user, PERM.SHIFT_READ, franchiseId || undefined),
    [franchiseId, user],
  );
  const canShiftWrite = useMemo(
    () => !isStaff && can(user, PERM.SHIFT_WRITE, franchiseId || undefined),
    [franchiseId, isStaff, user],
  );
  const canAssignmentRead = useMemo(
    () =>
      isStaff ||
      can(user, PERM.SHIFT_ASSIGNMENT_READ, franchiseId || undefined),
    [franchiseId, isStaff, user],
  );
  const canAssignmentWrite = useMemo(
    () =>
      !isStaff &&
      can(user, PERM.SHIFT_ASSIGNMENT_WRITE, franchiseId || undefined),
    [franchiseId, isStaff, user],
  );

  return {
    selectedFranchiseId,
    effectiveFranchiseId,
    franchiseId,
    isGlobalContext,
    showShiftFranchiseLabel,
    isAdmin,
    isManager,
    isStaff,
    currentUserId,
    canShiftRead,
    canShiftWrite,
    canAssignmentRead,
    canAssignmentWrite,
  };
};
