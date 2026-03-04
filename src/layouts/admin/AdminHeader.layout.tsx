import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Store, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { getAccessibleFranchises } from "@/auth/rbac";
import ROUTER_URL from "@/routes/router.const";

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

  const selectedFranchiseId = useAdminContextStore(
    (s) => s.selectedFranchiseId,
  );
  const setSelectedFranchiseId = useAdminContextStore(
    (s) => s.setSelectedFranchiseId,
  );

  const franchises = useMemo(() => getAccessibleFranchises(user), [user]);

  useEffect(() => {
    if (!franchises.length) return;

    const defaultId = user?.active_context?.franchise_id ?? franchises[0].id;

    const ok = franchises.some((f) => f.id === defaultId);

    if (!ok) {
      setSelectedFranchiseId(franchises[0].id);
    } else {
      setSelectedFranchiseId(defaultId);
    }
  }, [franchises, user, setSelectedFranchiseId]);

  const [open, setOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="h-full px-4 flex items-center justify-between gap-3">
        {/* Franchise Switcher */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
            <Store size={18} className="text-gray-700" />
          </div>

          <div className="min-w-0">
            <div className="text-xs text-gray-500 font-medium">Franchise</div>

            {franchises.length <= 1 ? (
              <div className="text-sm font-semibold text-gray-900 truncate">
                {franchises[0]?.name ?? "—"}
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  className="h-9 px-3 pr-9 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-900
                             hover:bg-gray-50 transition w-[320px] max-w-[55vw] truncate text-left"
                >
                  {(() => {
                    const cur = franchises.find(
                      (f) => f.id === selectedFranchiseId,
                    );
                    return cur ? `${cur.code} — ${cur.name}` : "Chọn chi nhánh";
                  })()}
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                </button>

                {open && (
                  <div
                    className="absolute mt-2 w-[360px] max-w-[70vw] bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden"
                    onMouseLeave={() => setOpen(false)}
                  >
                    <div className="max-h-72 overflow-auto">
                      {franchises.map((f) => {
                        const active = f.id === selectedFranchiseId;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => {
                              setSelectedFranchiseId(f.id);
                              setOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition flex items-center justify-between gap-3 ${
                              active ? "bg-primary/5" : ""
                            }`}
                          >
                            <span className="truncate font-medium text-gray-900">
                              {f.code} — {f.name}
                            </span>
                            {active ? (
                              <span className="text-xs font-semibold text-primary">
                                Đang chọn
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-semibold text-gray-900 leading-4">
              {user?.name ?? "—"}
            </div>
            <div className="text-xs text-gray-500">{user?.email ?? ""}</div>
          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_PROFILE)}
            className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold hover:bg-gray-800 transition cursor-pointer"
            title="View Profile"
          >
            {initials(user?.name)}
          </button>

          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-xl
                       border border-gray-200 bg-white text-sm font-medium text-gray-800
                       hover:bg-gray-50 transition"
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
