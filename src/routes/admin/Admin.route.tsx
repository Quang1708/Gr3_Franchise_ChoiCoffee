import React, { Suspense } from "react";
import { Route } from "react-router-dom";

import AdminLayout from "../../layouts/admin/Admin.layout";
import AdminGuard from "../guard/AdminGuard.route";
import ROUTER_URL from "../router.const";

const DashboardPage = React.lazy(() => import("../../pages/admin/dashboard"));
const MenuPage = React.lazy(() => import("../../pages/admin/menu"));
const CategoryPage = React.lazy(() => import("../../pages/admin/category"));
const CustomerPage = React.lazy(() => import("../../pages/admin/customer"));
const FranchisePage = React.lazy(() => import("../../pages/admin/franchise"));
const InventoryPage = React.lazy(() => import("../../pages/admin/inventory"));
const LoyaltyPage = React.lazy(() => import("../../pages/admin/loyalty"));
const OrderPage = React.lazy(() => import("../../pages/admin/order"));
const PaymentPage = React.lazy(() => import("../../pages/admin/payment"));
const ProductPage = React.lazy(() => import("../../pages/admin/product"));
const UserPage = React.lazy(() => import("../../pages/admin/user"));
const SettingsPage = React.lazy(() => import("../../pages/admin/settings"));
const LogoutPage = React.lazy(() => import("../../pages/admin/logout"));

const AdminRoutes = (
  <Route path={ROUTER_URL.ADMIN} element={<AdminGuard />}>
    <Route
      element={
        <Suspense fallback={null}>
          <AdminLayout />
        </Suspense>
      }
    >
      <Route
        index
        element={
          <Suspense fallback={null}>
            <DashboardPage />
          </Suspense>
        }
      />
      <Route
        path="menu"
        element={
          <Suspense fallback={null}>
            <MenuPage />
          </Suspense>
        }
      />
      <Route
        path="dashboard"
        element={
          <Suspense fallback={null}>
            <DashboardPage />
          </Suspense>
        }
      />
      <Route
        path="category"
        element={
          <Suspense fallback={null}>
            <CategoryPage />
          </Suspense>
        }
      />
      <Route
        path="customer"
        element={
          <Suspense fallback={null}>
            <CustomerPage />
          </Suspense>
        }
      />
      <Route
        path="franchise"
        element={
          <Suspense fallback={null}>
            <FranchisePage />
          </Suspense>
        }
      />
      <Route
        path="inventory"
        element={
          <Suspense fallback={null}>
            <InventoryPage />
          </Suspense>
        }
      />
      <Route
        path="loyalty"
        element={
          <Suspense fallback={null}>
            <LoyaltyPage />
          </Suspense>
        }
      />
      <Route
        path="order"
        element={
          <Suspense fallback={null}>
            <OrderPage />
          </Suspense>
        }
      />
      <Route
        path="payment"
        element={
          <Suspense fallback={null}>
            <PaymentPage />
          </Suspense>
        }
      />
      <Route
        path="product"
        element={
          <Suspense fallback={null}>
            <ProductPage />
          </Suspense>
        }
      />
      <Route
        path="user"
        element={
          <Suspense fallback={null}>
            <UserPage />
          </Suspense>
        }
      />
      <Route
        path="settings"
        element={
          <Suspense fallback={null}>
            <SettingsPage />
          </Suspense>
        }
      />
      <Route
        path="logout"
        element={
          <Suspense fallback={null}>
            <LogoutPage />
          </Suspense>
        }
      />
    </Route>
  </Route>
);

export default AdminRoutes;
