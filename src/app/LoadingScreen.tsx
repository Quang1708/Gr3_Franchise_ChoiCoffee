import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ROUTER_URL from "@/routes/router.const";
import logo from "@/assets/Logo/Logo.png";

const LoadingScrren = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_DASHBOARD, { replace: true });
    }, 1200); // 1–1.5s là đẹp

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-light">
      <div className="w-24 h-24 mb-6 rounded-full overflow-hidden border border-gray-200">
        <img src={logo} alt="Logo" className="w-full h-full object-contain" />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" />
        <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce delay-150" />
        <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce delay-300" />
      </div>

      <p className="text-sm text-gray-500 font-medium">
        Đang khởi tạo hệ thống...
      </p>
    </div>
  );
};

export default LoadingScrren;
