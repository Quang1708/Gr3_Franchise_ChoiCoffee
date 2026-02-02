import { NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Settings,
    ShoppingBag,
    BarChart3,
    Coffee,
    Tag
} from "lucide-react";

interface MenuItem {
    icon: React.ReactNode;
    label: string;
    path: string;
}

const menuItems: MenuItem[] = [
    {
        icon: <LayoutDashboard size={20} />,
        label: "Bảng điều khiển",
        path: "/client/dashboard",
    },
    {
        icon: <ShoppingBag size={20} />,
        label: "Đơn hàng",
        path: "/client/order",
    },
    {
        icon: <Tag size={20} />,
        label: "Sản phẩm",
        path: "/client/product",
    },
    {
        icon: <BarChart3 size={20} />,
        label: "Báo cáo",
        path: "/client/report",
    },
];

const ClientOrderSidebar = () => {
    const location = useLocation();

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#181511' }}>
            {/* Logo Section */}
            <div className="p-4 border-b border-espresso">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                        <Coffee className="text-white" size={24} />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-white font-bold text-lg">ChoiCoffee</h2>
                        <p className="text-clay text-xs">Nhượng quyền</p>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                ? "bg-primary/20 text-primary border-l-4 border-primary"
                                : "text-white hover:bg-espresso"
                                }`}
                        >
                            <span className={`shrink-0 ${isActive ? "text-primary" : "text-white"}`}>
                                {item.icon}
                            </span>
                            <span className={`font-medium ${isActive ? "text-primary" : "text-white"}`}>
                                {item.label}
                            </span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Settings at bottom */}
            <div className="p-4 border-t border-espresso">
                <NavLink
                    to="/client/settings"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === "/client/settings"
                        ? "bg-primary/20 text-primary border-l-4 border-primary"
                        : "text-white hover:bg-espresso"
                        }`}
                >
                    <Settings size={20} />
                    <span className="font-medium">Cài đặt</span>
                </NavLink>
            </div>
        </div>
    );
};

export default ClientOrderSidebar;
