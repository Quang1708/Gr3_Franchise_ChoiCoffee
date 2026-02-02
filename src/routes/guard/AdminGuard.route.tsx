import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import ROUTER_URL from "../router.const";
import { getCurrentUser } from "../../utils/localStorage.util";
import { ROLE } from "../../models/role.model";

const isAdminAuthenticated = () => {
  const user = getCurrentUser();
  return Boolean(user && user.role === ROLE.ADMIN);
};

const AdminGuard: React.FC = () => {
  return isAdminAuthenticated() ? <Outlet /> : <Navigate to={ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN} />;
};

export default AdminGuard;
