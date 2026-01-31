import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ClientAuthRoutes from "./routes/client/ClientAuth.route";
import { ClientPublicRoutes } from "./routes/client/ClientPublic.route";
import NotFoundPage from "./pages/NotFoundPage.page";
import { Toaster } from "sonner";
import { AdminAuthRoutes } from "./routes/admin/AdminAuth.route";
import AdminRoutes from "./routes/admin/Admin.route";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
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
