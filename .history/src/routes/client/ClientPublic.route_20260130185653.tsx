import { Route } from "react-router-dom";
import ClientLayout from "../../layouts/client/Client.layout";
import HomePage from "../../pages/Home.page";
import ROUTER_URL from "../router.const";
import ContactPage from "../../pages/Contact.page";

export const ClientPublicRoutes = (
   <Route element = {<ClientLayout/>}>
      <Route path = {ROUTER_URL.HOME} element = {<HomePage/>}/>
      <Route path={ROUTER_URL.ABOUT} element={<AboutPage />} />
         <Route path={ROUTER_URL.CONTACT} element={<ContactPage />} />
   </Route>

)