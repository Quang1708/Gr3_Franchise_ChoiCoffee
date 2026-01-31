import { Route } from "react-router-dom";
import AdminLayout from "../../layouts/admin/Admin.layout";
import DashboardPage from "../../pages/admin/dashboard/Dashboard.page";
import CategoryPage from "../../pages/admin/category/Category.page";
import CustomerPage from "../../pages/admin/customer/Customer.page";
import FranchisePage from "../../pages/admin/franchise/Franchise.page";
import InventoryPage from "../../pages/admin/inventory/Inventory.page";
import LoyaltyPage from "../../pages/admin/loyalty/Loyalty.page";
import OrderPage from "../../pages/admin/order/Order.page";
import PaymentPage from "../../pages/admin/payment/Payment.page";
import ProductPage from "../../pages/admin/product/Product.page";
import UserPage from "../../pages/admin/user/User.page";
import SettingsPage from "../../pages/admin/settings/Settings.page";
import LogoutPage from "../../pages/admin/logout/Logout.page";
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
