import { useAdminContextStore } from "@/stores/adminContext.store";
import { can } from "@/auth/rbac";
import { useAuthStore } from "@/stores";
import { Navigate, Outlet } from "react-router-dom";
import type { PermissionCode } from "@/auth/rbac.permissions";
import { getItemInLocalStorage } from "@/utils/localStorage.util";
import { LOCAL_STORAGE } from "@/consts";
type Props = { perm: PermissionCode };

const RequirePermission = ({ perm }: Props) => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const franchiseId = useAdminContextStore((s) => s.selectedFranchiseId);

  const contextRequired = Boolean(
    getItemInLocalStorage<boolean>(LOCAL_STORAGE.ADMIN_CONTEXT_REQUIRED),
  );

  if (!user || !token) {
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
