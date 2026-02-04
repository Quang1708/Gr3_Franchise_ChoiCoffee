import { Route } from "react-router-dom";
import ClientLayout from "../../layouts/client/Client.layout";
import OrderPage from "../../pages/client/order";
import OrderDetailPage from "../../pages/client/order/OrderDetail.index";
import ROUTER_URL from "../router.const";

const ClientAuthRoutes = (
    <>
        <Route path={`${ROUTER_URL.CLIENT}/order`} element={<OrderPage />} />
        <Route path={ROUTER_URL.CLIENT_ROUTER.CLIENT_ORDER_DETAIL} element={<OrderDetailPage />} />
        <Route path={ROUTER_URL.CLIENT} element={<ClientLayout />}>
        </Route>
    </>
)

export default ClientAuthRoutes