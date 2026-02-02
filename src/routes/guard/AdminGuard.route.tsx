import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import ROUTER_URL from "../router.const";
import { useAuthStore } from "../../stores/auth.store";

const AdminGuard = () => {
  const { user, token, isInitialized, hydrate } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) hydrate();
  }, [isInitialized, hydrate]);

  if (!isInitialized) return null;

  if (!user || !token || user.role !== "admin") {
    return <Navigate to={ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN} replace />;
  }

  return <Outlet />;
};

export default AdminGuard;
