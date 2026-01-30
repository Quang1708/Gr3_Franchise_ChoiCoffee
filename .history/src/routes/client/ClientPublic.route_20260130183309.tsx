import { Route } from "react-router-dom";
import ClientLayout from "../../layouts/client/Client.layout";
import HomePage from "../../pages/Home.page";

export const ClientPublicRoutes = (
   <Route element = {<ClientLayout/>}>
        <Route path = "/" element = {<HomePage/>}/>
   </Route>

   
)