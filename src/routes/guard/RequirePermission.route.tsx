import { Navigate, Outlet } from "react-router-dom";
import ROUTER_URL from "../router.const";
import { useAuthStore } from "@/stores/auth.store";
import { canAny } from "@/auth/rbac";
import type { PermissionCode } from "@/auth/rbac.permissions";

type Props = { perm: PermissionCode };

/**
 * Route guard theo RBAC (tạm).
 * - Vì chưa có API/tenant context trong URL, guard dùng canAny().
 * - UI/action-level vẫn dùng can(user, perm, selectedFranchiseId).
 */
const RequirePermission = ({ perm }: Props) => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  if (!user || !token) {
    return <Navigate to={ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN} replace />;
  }

  if (!canAny(user, perm)) {
    return <Navigate to={ROUTER_URL.ADMIN_ROUTER.ADMIN_DASHBOARD} replace />;
  }

  return <Outlet />;
};

export default RequirePermission;
