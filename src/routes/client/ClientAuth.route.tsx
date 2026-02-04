import React from "react";
import { Route } from "react-router-dom";
import ClientLayout from "../../layouts/client/Client.layout";
import OrderPage from "../../pages/client/order";
import OrderDetailPage from "../../pages/client/order/OrderDetail.index";
import ROUTER_URL from "../router.const";
import CartPage from "@/pages/client/cart/Cart.page";
import CheckoutPage from "@/pages/client/checkout/Checkout.page";

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
    <Route element={<ClientLayout />}>
      {" "}
      <Route path={`${ROUTER_URL.CLIENT}/order`} element={<OrderPage />} />
      <Route path={ROUTER_URL.CLIENT_ROUTER.CART} element={<CartPage />} />
      <Route path={ROUTER_URL.CLIENT_ROUTER.CHECKOUT} element={<CheckoutPage />} />
      <Route
        path={ROUTER_URL.CLIENT_ROUTER.CLIENT_ORDER_DETAIL}
        element={<OrderDetailPage />}
      />
    </Route>
  </>
);

export default ClientAuthRoutes;
