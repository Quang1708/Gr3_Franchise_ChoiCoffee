import { Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ClientAuthRoutes from "./routes/client/ClientAuth.route";
import { ClientPublicRoutes } from "./routes/client/ClientPublic.route";
import NotFoundPage from "./pages/NotFoundPage.page";
import { Toaster } from "sonner";
import AdminAuthRoutes from "./routes/admin/AdminAuth.route";
import AdminRoutes from "./routes/admin/Admin.route";
import { ToastContainer } from "react-toastify";
import { useAuthStore } from "./stores/auth.store";
import { useAdminContextStore } from "./stores/adminContext.store";

function App() {
  useEffect(() => {
    useAuthStore.getState().hydrate();
    useAdminContextStore.getState().hydrate();
  }, []);

  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Admin Auth */}
          {AdminAuthRoutes}
          {AdminRoutes}
          {/* Client */}
          {ClientAuthRoutes}
          {ClientPublicRoutes}

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
