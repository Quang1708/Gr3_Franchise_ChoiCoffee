import { Route } from "react-router-dom";
import AdminLayout from "../../layouts/admin/Admin.layout";
import DashboardPage from "../../pages/admin/dashboard";
import CategoryPage from "../../pages/admin/category";
import CustomerPage from "../../pages/admin/customer";
import FranchisePage from "../../pages/admin/franchise";
import InventoryPage from "../../pages/admin/inventory";
import LoyaltyPage from "../../pages/admin/loyalty";
import OrderPage from "../../pages/admin/order";
import PaymentPage from "../../pages/admin/payment";
import ProductPage from "../../pages/admin/product";
import UserPage from "../../pages/admin/user";
import SettingsPage from "../../pages/admin/settings";
import LogoutPage from "../../pages/admin/logout";
import ROUTER_URL from "../router.const";

const AdminRoutes = (
  <Route path={ROUTER_URL.ADMIN} element={<AdminLayout />}>
    <Route index element={<DashboardPage />} />
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="category" element={<CategoryPage />} />
    <Route path="customer" element={<CustomerPage />} />
    <Route path="franchise" element={<FranchisePage />} />
    <Route path="inventory" element={<InventoryPage />} />
    <Route path="loyalty" element={<LoyaltyPage />} />
    <Route path="order" element={<OrderPage />} />
    <Route path="payment" element={<PaymentPage />} />
    <Route path="product" element={<ProductPage />} />
    <Route path="user" element={<UserPage />} />
    <Route path="settings" element={<SettingsPage />} />
    <Route path="logout" element={<LogoutPage />} />
  </Route>
);

export default AdminRoutes;
