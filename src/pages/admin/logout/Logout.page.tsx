import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ROUTER_URL from "../../../routes/router.const";

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Implement logout logic (clear tokens, etc.)
    // For now, just redirect to home
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
