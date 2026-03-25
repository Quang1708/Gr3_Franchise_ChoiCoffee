import { Navigate, Outlet, useLocation } from "react-router-dom";
import ROUTER_URL from "../router.const";
import { useAuthStore } from "../../stores/auth.store";
import { SESSION_STORAGE } from "@/consts/sessionstorage.const";
import { getItemInSessionStorage } from "@/utils/sessionStorage.util";
import ClientLoading from "@/components/Client/Client.Loading";

const AdminGuard = () => {
  const location = useLocation();
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) return <ClientLoading />;

  const allowed = ["ADMIN", "MANAGER", "STAFF"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasAllowedRole = user?.roles?.some((r: any) =>
    allowed.includes(r.role_code),
  );

  if (!user || !hasAllowedRole) {
    return <Navigate to={ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN} replace />;
  }

  const contextRequired = Boolean(
    getItemInSessionStorage<boolean>(
      SESSION_STORAGE.ADMIN_CONTEXT_REQUIRED,
    ),
  );
  if (
    contextRequired &&
    location.pathname !== ROUTER_URL.ADMIN_ROUTER.ADMIN_SELECT_CONTEXT
  ) {
    return (
      <Navigate to={ROUTER_URL.ADMIN_ROUTER.ADMIN_SELECT_CONTEXT} replace />
    );
  }

  return <Outlet />;
};

export default AdminGuard;
