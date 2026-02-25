import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../pages/admin/sidebar/AdminSidebar.page";
import AdminFooter from "./AdminFooter.layout";
import AdminHeader from "./AdminHeader.layout";

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        collapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((v) => !v)}
      />

      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <AdminHeader />

        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>

        <div className="mt-auto">
          <AdminFooter />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
