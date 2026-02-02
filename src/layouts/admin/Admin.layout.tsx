import { Outlet } from "react-router-dom";
import AdminSidebar from "../../pages/admin/sidebar";
import AdminHeader from "./AdminHeader.layout";
import AdminFooter from "./AdminFooter.layout";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar Wrapper - Fixed */}
        <div className="fixed left-0 top-0 bottom-0 h-screen z-50 group">
          <aside className="w-16 group-hover:w-64 h-full bg-gray-50 border-r border-gray-200 p-2 group-hover:p-4 transition-all duration-300 ease-in-out overflow-y-auto">
            <div className="bg-white rounded-lg shadow-sm p-3 group-hover:p-4 transition-all duration-300 h-full flex flex-col">
              <div className="flex-1 overflow-y-auto min-h-0">
                <AdminSidebar />
              </div>
            </div>
          </aside>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-16">
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
