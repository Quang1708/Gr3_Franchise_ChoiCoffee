import { Route } from "react-router-dom";
import ClientLayout from "../../layouts/client/Client.layout";

export const ClientPublicRoutes = (
   <Route element = {<ClientLayout/>}>
        <Route path = "/" element = {<div>Client Public Home Page</div>}/>
   </Route>
)