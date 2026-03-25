import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ROUTER_URL from "@/routes/router.const";
import ClientLoading from "@/components/Client/Client.Loading";
import { useAuthStore } from "@/stores/auth.store";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { SESSION_STORAGE } from "@/consts/sessionstorage.const";
import {
  getItemInSessionStorage,
  removeItemInSessionStorage,
} from "@/utils/sessionStorage.util";
import type {
  AdminLoginUserProfile,
  AdminRoleLike,
} from "../login/models/api.model";
import { getAdminProfile } from "../login/services/auth03.service";
import { switchAdminContext } from "../login/services/auth02.service";

const normalizeRoles = (rolesInput: unknown) =>
  Array.isArray(rolesInput)
    ? rolesInput.map((r) => {
        if (typeof r !== "object" || r === null) return r;
        const roleLike = r as AdminRoleLike;
        const normalizedRole = roleLike.role ?? roleLike.role_code;
        return {
          ...roleLike,
          role: normalizedRole,
          role_code: normalizedRole,
        };
      })
    : rolesInput;

const getRoleLabel = (role: AdminRoleLike) => {
  if (role.scope === "GLOBAL" || role.franchise_id == null) return "GLOBAL";
  if (role.franchise_name) return role.franchise_name;
  return `FRANCHISE ${role.franchise_id}`;
};

const resolveRoleFranchiseId = (role: AdminRoleLike) => {
  if (role.scope === "GLOBAL") return null;
  const rawId =
    role.franchise_id ??
    (role as { franchiseId?: string | number } | undefined)?.franchiseId ??
    null;
  if (rawId == null) return null;
  const normalized = String(rawId).trim().toLowerCase();
  if (!normalized || normalized === "null" || normalized === "undefined") {
    return null;
  }
  return String(rawId);
};

const AdminSelectContextPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setSelectedFranchiseId = useAdminContextStore(
    (s) => s.setSelectedFranchiseId,
  );
  const selectedFranchiseId = useAdminContextStore(
    (s) => s.selectedFranchiseId,
  );

  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number | null>(
    null,
  );
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);

  const roles = useMemo(() => {
    if (!user?.roles) return [];
    return Array.isArray(user.roles) ? (user.roles as AdminRoleLike[]) : [];
  }, [user]);

  const contextRequired = Boolean(
    getItemInSessionStorage<boolean>(
      SESSION_STORAGE.ADMIN_CONTEXT_REQUIRED,
    ),
  );

  useEffect(() => {
    if (!user) {
      navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_LOGIN, { replace: true });
      return;
    }

    if (roles.length <= 1) {
      const role = roles[0];
      const roleFranchiseId = role ? resolveRoleFranchiseId(role) : null;
      setSelectedFranchiseId(roleFranchiseId);
      removeItemInSessionStorage(SESSION_STORAGE.ADMIN_CONTEXT_REQUIRED);
      navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_DASHBOARD, { replace: true });
    }
  }, [user, roles, navigate, setSelectedFranchiseId]);

  useEffect(() => {
    if (selectedRoleIndex != null) return;

    const matchIndex = roles.findIndex((role) => {
      if (selectedFranchiseId == null) {
        return role.scope === "GLOBAL" || role.franchise_id == null;
      }
      return String(role.franchise_id) === String(selectedFranchiseId);
    });

    if (matchIndex >= 0) {
      setSelectedRoleIndex(matchIndex);
    }
  }, [roles, selectedFranchiseId, selectedRoleIndex]);

  const handleSwitchContext = async () => {
    if (selectedRoleIndex == null) {
      setContextError("Vui lòng chọn Roles.");
      return;
    }

    const selected = roles[selectedRoleIndex];
    if (!selected) return;

    const roleFranchiseId = resolveRoleFranchiseId(selected);

    setContextLoading(true);
    setContextError(null);

    // Note: switch-context expects franchise_id as string or null per spec.
    try {
      const response = await switchAdminContext({
        franchise_id: roleFranchiseId,
      });

      if (!response?.success) {
        const fallbackMessage = response?.errors?.[0]?.message;
        setContextError(
          response?.message || fallbackMessage || "Không thể chuyển Roles.",
        );
        return;
      }

      try {
        const profile = await getAdminProfile();

        if (profile.success && profile.data) {
          const profileUser =
            (profile.data as { user?: AdminLoginUserProfile } | null)?.user ??
            (profile.data as AdminLoginUserProfile);

          const normalizedRoles = normalizeRoles(
            (profile.data as { roles?: unknown } | null)?.roles,
          );

          const fallbackRoles = normalizeRoles(profileUser?.roles);

          const mergedRoles = Array.isArray(normalizedRoles)
            ? normalizedRoles
            : fallbackRoles;

          const userWithRoles =
            profileUser && Array.isArray(mergedRoles)
              ? {
                  ...(profileUser as AdminLoginUserProfile),
                  roles: mergedRoles as AdminRoleLike[],
                }
              : profileUser;

          if (userWithRoles) {
            setAuth(userWithRoles as AdminLoginUserProfile, null);
          }
        }
      } catch (profileError) {
        console.error("Get profile failed after switch context", profileError);
        if (user) {
          setAuth(user, null);
        }
      }

      setSelectedFranchiseId(roleFranchiseId);

      removeItemInSessionStorage(SESSION_STORAGE.ADMIN_CONTEXT_REQUIRED);

      navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_DASHBOARD, { replace: true });
    } catch (error) {
      console.error(error);
      const err = error as { message?: string };
      setContextError(
        err.message || "Không thể chuyển Roles. Vui lòng thử lại.",
      );
    } finally {
      setContextLoading(false);
    }
  };

  const handleExit = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      {contextLoading && <ClientLoading />}
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg border border-gray-200">
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            ChoiCoffee Admin
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Chọn Roles</h1>
          <p className="text-sm text-gray-500">Vui lòng chọn Roles của bạn.</p>
        </div>

        {contextRequired && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Vui lòng chọn Roles để vào hệ thống.
          </div>
        )}

        <div className="mt-5 flex items-center justify-between text-xs text-gray-500">
          <div>Danh sách Roles</div>
          <div>{roles.length} Roles</div>
        </div>

        <div className="mt-3 grid gap-2">
          {roles.map((role, index) => {
            const active = selectedRoleIndex === index;
            return (
              <button
                key={`${role.role ?? "role"}-${index}`}
                type="button"
                onClick={() => setSelectedRoleIndex(index)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                  active
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 hover:bg-gray-50"
                } cursor-pointer`}
              >
                <div className="font-semibold">{role.role ?? "ROLE"}</div>
                <div className="mt-1 text-xs text-gray-500">
                  {getRoleLabel(role)}
                </div>
              </button>
            );
          })}
        </div>

        {contextError && (
          <div className="mt-3 text-sm text-red-500">{contextError}</div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleExit}
            className="h-9 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            disabled={contextLoading}
          >
            Thoát
          </button>
          <button
            type="button"
            onClick={handleSwitchContext}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90 cursor-pointer"
            disabled={contextLoading}
          >
            {contextLoading ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSelectContextPage;
