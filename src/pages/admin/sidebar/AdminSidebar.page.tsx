import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Package,
  Users,
  Store,
  Boxes,
  Gift,
  ShoppingCart,
  CreditCard,
  ShoppingBag,
  User,
  Menu,
} from "lucide-react";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const menuItems: MenuItem[] = [
  {
    icon: <LayoutDashboard size={20} />,
    label: "Dashboard",
    path: "dashboard",
  },
  {
    icon: <Menu size={20} />,
    label: "Menu",
    path: "menu",
  },
  {
    icon: <ShoppingBag size={20} />,
    label: "Products",
    path: "product",
  },

  {
    icon: <Package size={20} />,
    label: "Categories",
    path: "category",
  },
  {
    icon: <Users size={20} />,
    label: "Customers",
    path: "customer",
  },
  {
    icon: <ShoppingCart size={20} />,
    label: "Orders",
    path: "order",
  },
  {
    icon: <CreditCard size={20} />,
    label: "Payments",
    path: "payment",
  },
  {
    icon: <Boxes size={20} />,
    label: "Inventory",
    path: "inventory",
  },
  {
    icon: <Store size={20} />,
    label: "Franchise",
    path: "franchise",
  },
  {
    icon: <Gift size={20} />,
    label: "Loyalty",
    path: "loyalty",
  },
  {
    icon: <User size={20} />,
    label: "Users",
    path: "user",
  },
  {
    icon: <LogOut size={20} />,
    label: "Logout",
    path: "logout",
  },
];

type AdminSidebarProps = {
  collapsed?: boolean;
};

const AdminSidebar = ({ collapsed = false }: AdminSidebarProps) => {
  const location = useLocation();

  return (
    <div className="w-full min-w-0">
      <nav className="space-y-1.5">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === `/admin/${item.path}` ||
            (item.path === "dashboard" && location.pathname === "/admin");
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center rounded-lg min-w-0 transition-colors ${
                collapsed ? "justify-center px-2 h-10" : "justify-start gap-3 px-3 h-10"
              } ${
                isActive
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-700"
              }`}
              title={item.label}
            >
              <span
                className={`shrink-0 flex items-center justify-center ${isActive ? "text-purple-700" : "text-gray-600"}`}
              >
                {item.icon}
              </span>
              <span
                className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
                  isActive ? "text-purple-700" : "text-gray-700"
                } ${collapsed ? "hidden" : "inline-block"}`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;
