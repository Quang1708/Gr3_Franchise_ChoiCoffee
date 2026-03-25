import { NavLink, useLocation } from "react-router-dom";
import React, { useState } from "react";
import {
  LayoutDashboard,
  Store,
  Menu,
  ShoppingBag,
  Package,
  Users,
  ShoppingCart,
  CreditCard,
  Ticket,
  Boxes,
  Gift,
  User,
  CalendarCheck,
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { isMenuVisible } from "@/auth/menu.guard";

/* ================= TYPES ================= */
type MenuItem = {
  icon: React.ReactNode;
  label: string;
  path?: string;
  children?: MenuItem[];
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

/* ================= MENU ================= */
const menuSections: MenuSection[] = [
  {
    title: "Overview",
    items: [
      {
        icon: <LayoutDashboard size={18} />,
        label: "Dashboard",
        path: "dashboard",
      },
    ],
  },

  {
    title: "Catalog",
    items: [
      {
        icon: <Store size={18} />,
        label: "Franchise",
        children: [
          { label: "Franchise", path: "franchise", icon: <Store size={16} /> },
          {
            label: "Category Franchise",
            path: "category-franchise",
            icon: <Package size={16} />,
          },
          {
            label: "Product Franchise",
            path: "product-franchise",
            icon: <Package size={16} />,
          },
          {
            label: "Product Category",
            path: "product-category",
            icon: <Package size={16} />,
          },
        ],
      },

      { icon: <ShoppingBag size={18} />, label: "Products", path: "product" },
      { icon: <Package size={18} />, label: "Categories", path: "category" },
      { icon: <Menu size={18} />, label: "Menu", path: "menu" },
    ],
  },

  {
    title: "Operations",
    items: [
      { icon: <ShoppingCart size={18} />, label: "Orders", path: "order" },
      { icon: <Users size={18} />, label: "Customers", path: "customer" },
      { icon: <Boxes size={18} />, label: "Inventory", path: "inventory" },
      { icon: <ShoppingCart size={18} />, label: "Pos", path: "pos" },
      { icon: <ShoppingCart size={18} />, label: "Cart", path: "cart" },
      {
        icon: <CalendarCheck size={18} />,
        label: "Shift Assignment",
        path: "shift-assignment",
      },
      { icon: <User size={18} />, label: "Shift", path: "shift" },
    ],
  },

  {
    title: "Finance & Marketing",
    items: [
      { icon: <CreditCard size={18} />, label: "Payments", path: "payment" },
      { icon: <Ticket size={18} />, label: "Voucher", path: "voucher" },
      {
        icon: <BadgePercent size={18} />,
        label: "Promotion",
        path: "promotion",
      },
      { icon: <Gift size={18} />, label: "Loyalty", path: "loyalty" },
    ],
  },

  {
    title: "System",
    items: [{ icon: <User size={18} />, label: "Users", path: "user" }],
  },
];

/* ================= COMPONENT ================= */

const AdminSidebar = ({ collapsed = false, onToggle }: any) => {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const franchiseId =
    useAdminContextStore((s) => s.selectedFranchiseId) ?? null;

  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    );
  };

  /* ===== RBAC FILTER ===== */
  const visibleSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items
        .map((item) => {
          if (item.children) {
            const children = item.children.filter((child) =>
              isMenuVisible(user, franchiseId, child.path!),
            );
            if (!children.length) return null;
            return { ...item, children };
          }

          return isMenuVisible(user, franchiseId, item.path!) ? item : null;
        })
        .filter(Boolean),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* HEADER */}
      <div className="h-16 flex items-center justify-between px-3 border-b">
        {!collapsed && <div className="font-bold">ChoiCoffee</div>}

        <button onClick={onToggle}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-hide">
        {visibleSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <div className="text-xs text-gray-400 px-3 mb-2 uppercase">
                {section.title}
              </div>
            )}

            <div className="space-y-1">
              {section.items.map((item: any) => {
                /* ===== SUB MENU ===== */
                if (item.children) {
                  const isOpen = openMenus.includes(item.label);

                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => toggleMenu(item.label)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          {!collapsed && item.label}
                        </div>

                        {!collapsed && (
                          <ChevronDown
                            className={`transition ${
                              isOpen ? "rotate-180" : ""
                            }`}
                            size={16}
                          />
                        )}
                      </button>

                      {/* CHILDREN */}
                      {isOpen && !collapsed && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.children.map((child: any) => {
                            const isActive =
                              location.pathname === `/admin/${child.path}`;

                            return (
                              <NavLink
                                key={child.path}
                                to={`/admin/${child.path}`}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm
                                  ${
                                    isActive
                                      ? "bg-primary text-white"
                                      : "hover:bg-gray-100"
                                  }`}
                              >
                                {child.icon}
                                {child.label}
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                /* ===== NORMAL ITEM ===== */
                const isActive = location.pathname === `/admin/${item.path}`;

                return (
                  <NavLink
                    key={item.path}
                    to={`/admin/${item.path}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg
                      ${
                        isActive ? "bg-primary text-white" : "hover:bg-gray-100"
                      }`}
                  >
                    {item.icon}
                    {!collapsed && item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
