import { Route } from "react-router-dom";
import ClientLayout from "../../layouts/client/Client.layout";
import ROUTER_URL from "../router.const";
import { lazy } from "react";
const HomePage = lazy(() => import("../../pages/Home.page"));
const AboutPage = lazy(() => import("../../pages/About.page"));
const ContactPage = lazy(() => import("../../pages/Contact.page"));
const ClientProductPage = lazy(
  () => import("../../pages/client/product/Product.page"),
);
const ProductDetailPage = lazy(
  () => import("../../pages/client/product/ProductDetail.page"),
);
const FranchisePage = lazy(() => import("@/pages/Franchise.page"));

const ClientPublicRoutes = (
  <>
    <Route element={<ClientLayout />}>
      <Route path={ROUTER_URL.HOME} element={<HomePage />} />
      <Route path={ROUTER_URL.ABOUT} element={<AboutPage />} />
      <Route path={ROUTER_URL.CONTACT} element={<ContactPage />} />
      <Route path={ROUTER_URL.MENU} element={<ClientProductPage />} />
      <Route path={ROUTER_URL.FRANCHISE} element={<FranchisePage />} />
      <Route
        path={ROUTER_URL.CLIENT_ROUTER.PRODUCT_DETAIL}
        element={<ProductDetailPage />}
      />
    </Route>
  </>
);

export default ClientPublicRoutes;
