import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import ROUTER_URL from "../router.const";
import { useCustomerAuthStore } from "@/stores/customerAuth.store";
import { toastWarning } from "../../utils/toast.util";
import ClientLoading from "@/components/Client/Client.Loading";

const ClientGuard: React.FC = () => {
  const customer = useCustomerAuthStore((state) => state.customer);
  const isInitialized = useCustomerAuthStore((state) => state.isInitialized);
  const isLoggingOut = useCustomerAuthStore((state) => state.isLoggingOut);

  // Show loading while checking authentication
  if (!isInitialized) {
    return <ClientLoading />;
  }

  const isClientAuthenticated = Boolean(customer);

  // If user is logging out, don't show warning or redirect
  // Just let the logout process complete
  if (!isClientAuthenticated && !isLoggingOut) {
    toastWarning("Vui lòng đăng nhập để tiếp tục");
    return <Navigate to={ROUTER_URL.CLIENT_ROUTER.LOGIN} />;
  }

  // If logging out and not authenticated, return null to avoid rendering protected content
  if (!isClientAuthenticated && isLoggingOut) {
    return null;
  }

  return <Outlet />;
};

export default ClientGuard;
