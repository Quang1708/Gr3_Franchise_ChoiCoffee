import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AdminSidebar from "../../pages/admin/sidebar/AdminSidebar.page";
import AdminFooter from "./AdminFooter.layout";

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar Wrapper - Fixed */}
        <div className="fixed left-0 top-0 bottom-0 h-screen z-50">
          <aside
            className={`h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
              isSidebarCollapsed ? "w-16" : "w-64"
            }`}
          >
            <div className="flex items-center justify-end p-3 border-b border-gray-100">
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

            <div className="p-3">
              <AdminSidebar collapsed={isSidebarCollapsed} />
            </div>
          </aside>
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
            isSidebarCollapsed ? "ml-16" : "ml-64"
          }`}
        >
          <main className="flex-1">
            <Outlet />
          </main>
          <div className="mt-auto">
            <AdminFooter />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
