import { Outlet } from "react-router-dom";
import AdminSidebar from "../../pages/admin/sidebar";
import AdminHeader from "./AdminHeader.layout";
import AdminFooter from "./AdminFooter.layout";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="group w-16 hover:w-64 min-h-screen bg-gray-50 border-r border-gray-200 p-2 group-hover:p-4 transition-all duration-300 ease-in-out">
          <div className="bg-white rounded-lg shadow-sm p-3 group-hover:p-4 transition-all duration-300 overflow-hidden">
            <AdminSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
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
