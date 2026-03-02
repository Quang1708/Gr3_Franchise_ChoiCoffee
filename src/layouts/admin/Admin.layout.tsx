import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../pages/admin/sidebar/AdminSidebar.page";
import AdminFooter from "./AdminFooter.layout";
import AdminHeader from "./AdminHeader.layout";

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar
        collapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((v) => !v)}
      />

      <div
        className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Header cố định chiều cao */}
        <div className="shrink-0">
          <AdminHeader />
        </div>

        {/* Main chỉ scroll trong vùng này, không đẩy footer */}
        <main className="flex-1 min-h-0 overflow-auto">
          <Outlet />
        </main>

        {/* Footer không bị đẩy ra ngoài viewport */}
        <div className="shrink-0">
          <AdminFooter />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
