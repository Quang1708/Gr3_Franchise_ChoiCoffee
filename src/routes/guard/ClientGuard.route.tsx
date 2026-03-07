import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import ROUTER_URL from "../router.const";
import { useCustomerAuthStore } from "@/stores/customerAuth.store";
import { toastWarning } from "../../utils/toast.util";

const ClientGuard: React.FC = () => {
  const customer = useCustomerAuthStore((state) => state.customer);

  const isClientAuthenticated = Boolean(customer);

  if (!isClientAuthenticated) {
    toastWarning("Vui lòng đăng nhập để tiếp tục");
    return <Navigate to={ROUTER_URL.CLIENT_ROUTER.LOGIN} />;
  }

  return <Outlet />;
};

export default ClientGuard;
