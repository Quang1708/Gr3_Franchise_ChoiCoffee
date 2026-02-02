import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import ROUTER_URL from "../router.const";
import { getCurrentClient } from "../../utils/localStorage.util";
import { ROLE } from "../../models/role.model";
import { toastWarning } from "../../utils/toast.util";

const isClientAuthenticated = () => {
  const user = getCurrentClient();
  return Boolean(user && user.role === ROLE.CUSTOMER);
};

const ClientGuard: React.FC = () => {
  if (!isClientAuthenticated()) {
    toastWarning("Vui lòng đăng nhập để tiếp tục");
    return <Navigate to={ROUTER_URL.CLIENT_ROUTER.LOGIN} />;
  }

  return <Outlet />;
};

export default ClientGuard;
