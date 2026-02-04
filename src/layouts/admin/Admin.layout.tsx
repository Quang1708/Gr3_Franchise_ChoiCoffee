import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AdminSidebar from "../../pages/admin/sidebar/AdminSidebar.page";
import AdminHeader from "./AdminHeader.layout";
import AdminFooter from "./AdminFooter.layout";

const AdminLayout = () => {
  // 默认展开侧边栏（不再依赖 hover）
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar Wrapper - Fixed */}
        <div className="fixed left-0 top-0 bottom-0 h-screen z-50">
          <aside
            className={`h-full bg-gray-50 border-r border-gray-200 transition-all duration-300 ease-in-out ${
              isSidebarCollapsed ? "w-16 p-2" : "w-64 p-4"
            }`}
          >
            <div
              className={`bg-white rounded-lg shadow-sm h-full flex flex-col transition-all duration-300 ${
                isSidebarCollapsed ? "p-3" : "p-4"
              }`}
            >
              <div className="flex items-center justify-end pb-3 mb-2 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed((v) => !v)}
                  aria-label={
                    isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                  }
                  className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-200 bg-white text-gray-700 transition-colors"
                >
                  {isSidebarCollapsed ? (
                    <ChevronRight size={18} />
                  ) : (
                    <ChevronLeft size={18} />
                  )}
                </button>
              </div>

              <div>
                <AdminSidebar collapsed={isSidebarCollapsed} />
              </div>
            </div>
          </aside>
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isSidebarCollapsed ? "ml-16" : "ml-64"
          }`}
        >
          <AdminHeader />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
          <AdminFooter />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
