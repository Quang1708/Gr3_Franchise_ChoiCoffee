import { Route } from "react-router-dom";
import ClientLayout from "../../layouts/client/Client.layout";
import HomePage from "../../pages/Home.page";
import ROUTER_URL from "../router.const";
import ContactPage from "../../pages/Contact.page";
import AboutPage from "../../pages/About.page";
import ClientProductPage from "../../pages/client/product/Product.page";
import ProductDetailPage from "../../pages/client/product/ProductDetail.page";

export const ClientPublicRoutes = (
   <Route element = {<ClientLayout/>}>
      <Route path = {ROUTER_URL.HOME} element = {<HomePage/>}/>
      <Route path={ROUTER_URL.ABOUT} element={<AboutPage />} />
      <Route path={ROUTER_URL.CONTACT} element={<ContactPage />} />
      <Route path={ROUTER_URL.MENU} element={<ClientProductPage />} />
      <Route path={ROUTER_URL.CLIENT_ROUTER.PRODUCT_DETAIL} element={<ProductDetailPage />} />
   </Route>

)