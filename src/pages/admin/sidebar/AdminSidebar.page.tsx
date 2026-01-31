import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Package, 
  Users, 
  Store, 
  Boxes, 
  Gift, 
  ShoppingCart, 
  CreditCard, 
  ShoppingBag,
  User
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
    icon: <Settings size={20} />,
    label: "Settings",
    path: "settings",
  },
  {
    icon: <LogOut size={20} />,
    label: "Logout",
    path: "logout",
  },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <div className="w-full">
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === `/admin/${item.path}` || 
                          (item.path === "dashboard" && location.pathname === "/admin");
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className={isActive ? "text-purple-700" : "text-gray-600"}>
                {item.icon}
              </span>
              <span className={`font-medium ${isActive ? "text-purple-700" : "text-gray-700"}`}>
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
