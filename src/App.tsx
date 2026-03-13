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
import { useCustomerAuthStore } from "./stores/customerAuth.store";
import { getCustomerProfile } from "./pages/client/account/partial/service/customerAuth02.service";

function App() {
  useEffect(() => {
    useAuthStore.getState().hydrate();
    useAdminContextStore.getState().hydrate();

    // Initialize customer auth - restore from accessToken cookie if available
    const initializeCustomerAuth = async () => {
      const { setCustomer, setInitialized } = useCustomerAuthStore.getState();
      try {
        // Try to get customer profile using accessToken from httpOnly cookie
        const customerProfile = await getCustomerProfile();

        // If successful, restore customer to store
        setCustomer({
          id: customerProfile.id,
          email: customerProfile.email,
          phone: customerProfile.phone,
          name: customerProfile.name,
          avatar_url: customerProfile.avatar_url,
          address: customerProfile.address,
        });
      } catch (error) {
        // If fail (401/403), user is not logged in - do nothing
        console.log("No active customer session", error);
      } finally {
        setInitialized(true);
      }
    };

    initializeCustomerAuth();
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
      <Suspense>
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
