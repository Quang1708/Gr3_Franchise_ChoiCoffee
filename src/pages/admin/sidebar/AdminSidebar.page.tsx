import { NavLink, useLocation } from "react-router-dom";
import React from "react";
import {
  LayoutDashboard,
  Store,
  Menu,
  ShoppingBag,
  Package,
  Users,
  ShoppingCart,
  CreditCard,
  Boxes,
  Gift,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { isMenuVisible } from "@/auth/menu.guard";

export type MenuItem = {
  icon: React.ReactNode;
  label: string;
  path: string;
};

const menuItems: MenuItem[] = [
  {
    icon: <LayoutDashboard size={20} />,
    label: "Dashboard",
    path: "dashboard",
  },
  { icon: <Store size={20} />, label: "Franchise", path: "franchise" },
  { icon: <Menu size={20} />, label: "Menu", path: "menu" },
  { icon: <ShoppingBag size={20} />, label: "Products", path: "product" },
  { icon: <Package size={20} />, label: "Categories", path: "category" },
  { icon: <Users size={20} />, label: "Customers", path: "customer" },
  { icon: <ShoppingCart size={20} />, label: "Orders", path: "order" },
  { icon: <CreditCard size={20} />, label: "Payments", path: "payment" },
  { icon: <Boxes size={20} />, label: "Inventory", path: "inventory" },
  { icon: <Gift size={20} />, label: "Loyalty", path: "loyalty" },
  { icon: <User size={20} />, label: "Users", path: "user" },
  { icon: <LogOut size={20} />, label: "Logout", path: "logout" },
];

type AdminSidebarProps = {
  collapsed?: boolean;
  onToggle?: () => void; // ✅ NEW: để layout điều khiển state
};

const AdminSidebar = ({ collapsed = false, onToggle }: AdminSidebarProps) => {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const franchiseId = useAdminContextStore((s) => s.selectedFranchiseId);

  const visibleItems = menuItems.filter((it) =>
    isMenuVisible(user, franchiseId, it.path),
  );

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* ✅ Header + nút toggle nằm TRONG sidebar */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-gray-200">
        <div className="min-w-0">
          {!collapsed ? (
            <div className="font-extrabold text-gray-900 truncate tracking-tight">
              ChoiCoffee
            </div>
          ) : (
            <div className="font-extrabold text-gray-900 text-center"></div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="shrink-0 inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-2 shadow-sm hover:shadow-md transition"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="p-2 space-y-1">
        {visibleItems.map((item) => {
          const isActive =
            location.pathname === `/admin/${item.path}` ||
            (item.path === "dashboard" && location.pathname === "/admin");

          const isLogout = item.path === "logout";

          return (
            <NavLink
              key={item.path}
              to={`/admin/${item.path}`}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                isLogout
                  ? "text-rose-700 hover:bg-rose-50"
                  : isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed ? (
                <span className="text-sm font-medium">{item.label}</span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
