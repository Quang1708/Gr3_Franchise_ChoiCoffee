import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ROUTER_URL from "@/routes/router.const";

import { clearAdminAuth } from "@/utils/localStorage.util";
import { removeItemInSessionStorage } from "@/utils/sessionStorage.util";

import { SESSION_STORAGE } from "@/consts/sessionstorage.const";

import ClientLoading from "@/components/Client/Client.Loading";

import { logoutApi } from "./services/Auth07.service";

import { useAuthStore } from "@/stores/auth.store";

import { toast } from "react-toastify";

const LogoutPage = () => {
  const navigate = useNavigate();

  const logoutStore = useAuthStore((s) => s.logout);

  useEffect(() => {
    const doLogout = async () => {
      try {
        await logoutApi();

        toast.success("Đăng xuất thành công");
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        /**
         * clear local storage
         */
        clearAdminAuth();
        removeItemInSessionStorage(SESSION_STORAGE.RESET_TOKEN);

        /**
         * reset zustand auth store
         */
        logoutStore();

        /**
         * redirect login
         */
        navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN, {
          replace: true,
        });
      }
    };

    doLogout();
  }, [navigate, logoutStore]);

  return <ClientLoading />;
};

export default LogoutPage;
