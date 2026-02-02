import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ROUTER_URL from "../../../routes/router.const";
import { removeItemInLocalStorage } from "../../../utils/localStorage.util";
import { LOCAL_STORAGE } from "../../../consts/localstorage.const";

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    removeItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_ADMIN);
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
