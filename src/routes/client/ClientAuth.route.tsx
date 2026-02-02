import React from "react";
import { Route } from "react-router-dom";
import ROUTER_URL from "../router.const";

const ClientLoginPage = React.lazy(
  () => import("@/pages/client/auth/login/ClientLogin.page"),
);
const ClientRegisterPage = React.lazy(
  () => import("@/pages/client/auth/register/ClientRegister.page"),
);
const ClientForgotPasswordPage = React.lazy(
  () => import("@/pages/client/auth/password/ClientForgotPassword.page"),
);

const ClientVerifyTokenPage = React.lazy(
  () => import("@/pages/client/auth/verify/ClientVerifyToken.page"),
);

const ClientAuthRoutes = (
  <>
    <Route
      path={ROUTER_URL.CLIENT_ROUTER.LOGIN}
      element={<ClientLoginPage />}
    />
    <Route
      path={ROUTER_URL.CLIENT_ROUTER.REGISTER}
      element={<ClientRegisterPage />}
    />
    <Route
      path={ROUTER_URL.CLIENT_ROUTER.FORGOT_PASSWORD}
      element={<ClientForgotPasswordPage />}
    />
    <Route
      path={ROUTER_URL.CLIENT_ROUTER.VERIFY}
      element={<ClientVerifyTokenPage />}
    />
  </>
);

export default ClientAuthRoutes;
