import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import ROUTER_URL from "../router.const";
import { useCustomerAuthStore } from "@/stores/customerAuth.store";
import ClientLoading from "@/components/Client/Client.Loading";

const ClientGuard: React.FC = () => {
  const customer = useCustomerAuthStore((state) => state.customer);
  const isInitialized = useCustomerAuthStore((state) => state.isInitialized);

  // Show loading while checking authentication
  if (!isInitialized) {
    return <ClientLoading />;
  }

  const isClientAuthenticated = Boolean(customer);

  // Redirect to login if not authenticated
  if (!isClientAuthenticated) {
    return <Navigate to={ROUTER_URL.CLIENT_ROUTER.LOGIN} replace />;
  }

  return <Outlet />;
};

export default ClientGuard;
