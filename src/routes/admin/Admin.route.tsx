import React from "react";
import { Route } from "react-router-dom";
import AdminLayout from "../../layouts/admin/Admin.layout";
import AdminGuard from "../guard/AdminGuard.route";
import RequirePermission from "../guard/RequirePermission.route";
import ROUTER_URL from "../router.const";
import { PERM } from "@/auth/rbac.permissions";
import ShiftPage from "@/pages/admin/shift/Shift.page";

/* ==================== PAGES ==================== */
const DashboardPage = React.lazy(() => import("../../pages/admin/dashboard"));
const MenuPage = React.lazy(() => import("../../pages/admin/menu"));
const CategoryPage = React.lazy(() => import("../../pages/admin/category"));
const CategoryFranchisePage = React.lazy(
  () => import("../../pages/admin/category/CategoryFranchise.page"),
);
const CustomerPage = React.lazy(() => import("../../pages/admin/customer"));
const FranchisePage = React.lazy(
  () => import("../../pages/admin/franchise/Franchise.page"),
);
const FranchiseDetailPage = React.lazy(
  () => import("../../pages/admin/franchise/FranchiseDetail.page"),
);
const InventoryPage = React.lazy(
  () => import("../../pages/admin/inventory/Inventory.page"),
);
const ShiftAssignmentPage = React.lazy(
  () => import("../../pages/admin/shift_assignment"),
);
const LoyaltyPage = React.lazy(() => import("../../pages/admin/loyalty"));
const OrderPage = React.lazy(() => import("../../pages/admin/order"));
const PaymentPage = React.lazy(() => import("../../pages/admin/payment"));
const VoucherPage = React.lazy(
  () => import("../../pages/admin/voucher/Voucher.page"),
);
const PromotionPage = React.lazy(
  () => import("../../pages/admin/promotion/Promotion.page"),
);
const ProductPage = React.lazy(() => import("../../pages/admin/product"));
const ProductCategoryFranchisePage = React.lazy(
  () => import("../../pages/admin/product_category_franchise"),
);
const UserPage = React.lazy(() => import("../../pages/admin/user"));
const UserFranchiseRolePage = React.lazy(
  () => import("../../pages/admin/user-franchise-role/UserFranchiseRole.page"),
);
const SettingsPage = React.lazy(() => import("../../pages/admin/settings"));
const LogoutPage = React.lazy(() => import("../../pages/admin/logout"));
const ProfilePage = React.lazy(() => import("../../pages/admin/profile"));
const AdminSelectContextPage = React.lazy(
  () => import("../../pages/admin/auth/context/AdminSelectContext.page"),
);

const CartPage = React.lazy(() => import("../../pages/admin/cart"));

/* ==================== ROUTES ==================== */

const AdminRoutes = (
  <>
    {/* ================= ADMIN (GUARDED) ================= */}
    <Route path={ROUTER_URL.ADMIN} element={<AdminGuard />}>
      <Route
        path={ROUTER_URL.ADMIN_ROUTER.ADMIN_SELECT_CONTEXT.replace(
          `${ROUTER_URL.ADMIN}/`,
          "",
        )}
        element={<AdminSelectContextPage />}
      />
      <Route element={<AdminLayout />}>
        {/* DEFAULT */}
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* READ ACCESS */}
        <Route element={<RequirePermission perm={PERM.MENU_READ} />}>
          <Route path="menu" element={<MenuPage />} />
        </Route>

        <Route element={<RequirePermission perm={PERM.PRODUCT_READ} />}>
          <Route path="product" element={<ProductPage />} />
        </Route>

        <Route element={<RequirePermission perm={PERM.CATEGORY_READ} />}>
          <Route path="category" element={<CategoryPage />} />
        </Route>

        <Route
          element={<RequirePermission perm={PERM.PRODUCT_CATEGORY_READ} />}
        >
          <Route
            path="product-category"
            element={<ProductCategoryFranchisePage />}
          />
        </Route>

        <Route
          element={<RequirePermission perm={PERM.CATEGORY_FRANCHISE_READ} />}
        >
          <Route
            path="category-franchise"
            element={<CategoryFranchisePage />}
          />
        </Route>

        <Route element={<RequirePermission perm={PERM.CUSTOMER_READ} />}>
          <Route path="customer" element={<CustomerPage />} />
        </Route>

        <Route element={<RequirePermission perm={PERM.ORDER_READ} />}>
          <Route path="order" element={<OrderPage />} />
        </Route>

        <Route element={<RequirePermission perm={PERM.INVENTORY_READ} />}>
          <Route path="inventory" element={<InventoryPage />} />
        </Route>

        <Route
          element={<RequirePermission perm={PERM.SHIFT_ASSIGNMENT_READ} />}
        >
          <Route path="shift-assignment" element={<ShiftAssignmentPage />} />
        </Route>

        <Route element={<RequirePermission perm={PERM.LOYALTY_READ} />}>
          <Route path="loyalty" element={<LoyaltyPage />} />
        </Route>

        <Route element={<RequirePermission perm={PERM.SHIFT_READ} />}>
          <Route path="shift" element={<ShiftPage />} />
        </Route>

        {/* ADMIN ONLY */}
        <Route element={<RequirePermission perm={PERM.FRANCHISE_MGMT} />}>
          <Route path="franchise" element={<FranchisePage />} />
          <Route path="franchise/:id" element={<FranchiseDetailPage />} />
        </Route>

        <Route element={<RequirePermission perm={PERM.PAYMENT_READ} />}>
          <Route path="payment" element={<PaymentPage />} />
        </Route>

        <Route element={<RequirePermission perm={PERM.VOUCHER_READ} />}>
          <Route path="voucher" element={<VoucherPage />} />
        </Route>

        <Route path="promotion" element={<PromotionPage />} />

        <Route element={<RequirePermission perm={PERM.USER_MANAGE} />}>
          <Route path="user" element={<UserPage />} />
          <Route
            path="user-franchise-role"
            element={<UserFranchiseRolePage />}
          />
        </Route>
        <Route element={<RequirePermission perm={PERM.CART_READ} />}>
          <Route path="cart" element={<CartPage/>} />
        </Route>

        {/* PUBLIC IN ADMIN */}
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="logout" element={<LogoutPage />} />
      </Route>
    </Route>
  </>
);

export default AdminRoutes;
