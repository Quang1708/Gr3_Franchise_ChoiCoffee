import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ROUTER_URL from "../../../routes/router.const";
import { clearAdminAuth } from "../../../utils/localStorage.util";
import { removeItemInSessionStorage } from "../../../utils/sessionStorage.util";
import { SESSION_STORAGE } from "../../../consts/sessionstorage.const";

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // clear auth + token + reset session
    clearAdminAuth();
    removeItemInSessionStorage(SESSION_STORAGE.RESET_TOKEN);
    setTimeout(() => {
      navigate(ROUTER_URL.HOME);
    }, 1000);
  }, [navigate]);

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  );
};

export default LogoutPage;
