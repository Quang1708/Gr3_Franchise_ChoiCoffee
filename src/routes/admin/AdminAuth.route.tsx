import React from "react";
import { Route } from "react-router-dom";
import ROUTER_URL from "../router.const";

const AdminLoginPage = React.lazy(
  () => import("../../pages/admin/auth/login/AdminLogin.page"),
);
const ForgotPasswordPage = React.lazy(
  () => import("../../pages/admin/auth/ForgotPassword.page"),
);
const ResetPasswordPage = React.lazy(
  () => import("../../pages/admin/auth/ResetPassword.page"),
);
const AdminVerifyTokenPage = React.lazy(
  () => import("../../pages/admin/auth/AdminVerifyTokenPage"),
);

const AdminAuthRoutes = (
  <>
    <Route
      path={ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN}
      element={<AdminLoginPage />}
    />
    <Route
      path={ROUTER_URL.ADMIN_ROUTER.FORGOT_PASSWORD}
      element={<ForgotPasswordPage />}
    />
    <Route
      path={ROUTER_URL.ADMIN_ROUTER.VERIFY_TOKEN}
      element={<AdminVerifyTokenPage />}
    />
    <Route
      path={ROUTER_URL.ADMIN_ROUTER.RESET_PASSWORD}
      element={<ResetPasswordPage />}
    />
  </>
);

export default AdminAuthRoutes;
