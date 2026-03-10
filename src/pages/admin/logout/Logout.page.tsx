import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ROUTER_URL from "../../../routes/router.const";
import ClientLoading from "@/components/Client/Client.Loading";
import { logout as logoutApi } from "@/services/adminAuth.service";
import { useAuthStore } from "@/stores/auth.store";
import { removeItemInSessionStorage } from "../../../utils/sessionStorage.util";
import { SESSION_STORAGE } from "../../../consts/sessionstorage.const";

const LogoutPage = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const handleLogout = async () => {
      setIsLoading(true);
      try {
        await logoutApi();
      } finally {
        if (!isActive) return;
        logout();
        removeItemInSessionStorage(SESSION_STORAGE.RESET_TOKEN);
        setIsLoading(false);
        navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN, { replace: true });
      }
    };

    handleLogout();

    return () => {
      isActive = false;
    };
  }, [logout, navigate]);

  return (
    <div className="p-6">
      {isLoading && <ClientLoading />}
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  );
};

export default LogoutPage;
