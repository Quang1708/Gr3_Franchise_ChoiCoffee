import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Store } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useAdminContextStore } from "@/stores/adminContext.store";
import ClientLoading from "@/components/Client/Client.Loading";
import { logout as logoutApi } from "@/pages/admin/auth/login/services/auth07.service";
import { removeItemInSessionStorage } from "@/utils/sessionStorage.util";
import { SESSION_STORAGE } from "@/consts/sessionstorage.const";

import ROUTER_URL from "@/routes/router.const";
import { LOCAL_STORAGE } from "@/consts/localstorage.const";
import { getItemInLocalStorage } from "@/utils/localStorage.util";

const initials = (name?: string) => {
  const s = (name ?? "").trim();
  if (!s) return "U";
  const parts = s.split(/\s+/);
  const a = parts[0]?.[0] ?? "U";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (a + b).toUpperCase();
};

const AdminHeader = () => {
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const selectedFranchiseId = useAdminContextStore(
    (s) => s.selectedFranchiseId,
  );

  const contextRequired = Boolean(
    getItemInLocalStorage<boolean>(LOCAL_STORAGE.ADMIN_CONTEXT_REQUIRED),
  );

  /**
   * Determine current role + franchise label
   */
  const currentRole = useMemo(() => {
    if (!user?.roles?.length) return null;

    return user.roles.find((role) => {
      if (selectedFranchiseId == null) {
        return role.scope === "GLOBAL";
      }

      return String(role.franchise_id) === String(selectedFranchiseId);
    });
  }, [user, selectedFranchiseId]);

  /**
   * Context label for left side
   */
  const contextLabel = useMemo(() => {
    if (!currentRole) return "Chưa chọn";

    const franchise =
      currentRole.scope === "GLOBAL"
        ? "GLOBAL"
        : (currentRole.franchise_name ??
          `FRANCHISE ${currentRole.franchise_id}`);

    return `${currentRole.role} - ${franchise}`;
  }, [currentRole]);

  /**
   * Display name changes when switching context
   */
  const displayName = useMemo(() => {
    if (!currentRole) return user?.name ?? "—";

    const franchise =
      currentRole.scope === "GLOBAL"
        ? "GLOBAL"
        : (currentRole.franchise_name ??
          `FRANCHISE ${currentRole.franchise_id}`);

    return `${currentRole.role} (${franchise})`;
  }, [currentRole, user]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await logoutApi();
    } finally {
      logout();
      removeItemInSessionStorage(SESSION_STORAGE.RESET_TOKEN);
      setIsLoggingOut(false);
      navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN, { replace: true });
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40">
      {isLoggingOut && <ClientLoading />}
      <div className="h-full px-4 flex items-center justify-between gap-3">
        {/* Franchise Switcher */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
            <Store size={18} className="text-gray-700" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {contextLabel}
              </div>

              {contextRequired && (
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Vui lòng chọn!
                </span>
              )}

              <button
                type="button"
                onClick={() =>
                  navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_SELECT_CONTEXT)
                }
                className="h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-800 hover:bg-gray-50 cursor-pointer"
              >
                Đổi Roles
              </button>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-semibold text-gray-900 leading-4">
              {displayName}
            </div>
            <div className="text-xs text-gray-500">{user?.email ?? ""}</div>
          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_PROFILE)}
            className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold hover:bg-gray-800 transition cursor-pointer"
            title="View Profile"
          >
            {initials(displayName)}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-xl
                     border border-gray-200 bg-white text-sm font-medium text-gray-800
                     hover:bg-gray-50 transition cursor-pointer"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
