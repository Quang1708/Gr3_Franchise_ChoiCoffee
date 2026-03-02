import { Navigate, Outlet } from "react-router-dom";
import ROUTER_URL from "../router.const";
import { useAuthStore } from "../../stores/auth.store";

const AdminGuard = () => {
  const { user, token, isInitialized } = useAuthStore();

  if (!isInitialized) return null;

  const allowed = ["ADMIN", "MANAGER", "STAFF"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasAllowedRole = user?.roles?.some((r: any) =>
    allowed.includes(r.role_code),
  );

  if (!user || !token || !hasAllowedRole) {
    return <Navigate to={ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN} replace />;
  }

  return <Outlet />;
};

export default AdminGuard;
