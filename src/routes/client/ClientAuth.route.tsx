import React from "react";
import { Route } from "react-router-dom";
import ClientLayout from "../../layouts/client/Client.layout";
import OrderPage from "../../pages/client/order";
import OrderDetailPage from "../../pages/client/order/OrderDetail.index";
import ROUTER_URL from "../router.const";
import CartPage from "@/pages/client/cart/Cart.page";
import CheckoutPage from "@/pages/client/checkout/Checkout.page";
import ClientProfilePage from "@/pages/client/account/profile/ClientProfile.page";
import LoyaltyPage from "@/pages/client/loyalty/Loyalty.page";
import ClientHistoryPage from "../../pages/client/history";

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

const PaymentStatusPage = React.lazy(
  () => import("@/pages/client/checkout/CheckoutStatus.page"),
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
    <Route path={ROUTER_URL.CLIENT_ROUTER.PAYMENT_STATUS} element={<PaymentStatusPage />} />
    <Route element={<ClientLayout />}>
      <Route path={`${ROUTER_URL.CLIENT}/order`} element={<OrderPage />} />
      <Route
        path={ROUTER_URL.CLIENT_ROUTER.HISTORY}
        element={<ClientHistoryPage />}
      />
      <Route path={ROUTER_URL.CLIENT_ROUTER.CART} element={<CartPage />} />
      <Route path={ROUTER_URL.CLIENT_ROUTER.CHECKOUT} element={<CheckoutPage />} />
      <Route path={ROUTER_URL.CLIENT_ROUTER.LOYALTY} element={<LoyaltyPage />} />
      <Route
        path={ROUTER_URL.CLIENT_ROUTER.CLIENT_ORDER_DETAIL}
        element={<OrderDetailPage />}
      />
      <Route
        path={ROUTER_URL.CLIENT_ROUTER.PROFILE}
        element={<ClientProfilePage />}
      />
    </Route>
  </>
);

export default ClientAuthRoutes;
