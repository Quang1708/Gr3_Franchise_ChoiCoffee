import { useAdminContextStore } from "@/stores/adminContext.store";
import { can } from "@/auth/rbac";
import { useAuthStore } from "@/stores";
import { Navigate, Outlet } from "react-router-dom";
import type { PermissionCode } from "@/auth/rbac.permissions";
import { getItemInSessionStorage } from "@/utils/sessionStorage.util";
import { SESSION_STORAGE } from "@/consts";
type Props = { perm: PermissionCode };

const RequirePermission = ({ perm }: Props) => {
  const user = useAuthStore((s) => s.user);
  const franchiseId = useAdminContextStore((s) => s.selectedFranchiseId);

  const contextRequired = Boolean(
    getItemInSessionStorage<boolean>(
      SESSION_STORAGE.ADMIN_CONTEXT_REQUIRED,
    ),
  );

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (contextRequired) {
    return <Navigate to="/admin/select-context" replace />;
  }

  if (!can(user, perm, franchiseId)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export default RequirePermission;
