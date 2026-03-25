import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AdminLoginUserProfile } from "@/pages/admin/auth/login/models/api.model";
import { SESSION_STORAGE } from "@/consts/sessionstorage.const";

type AuthState = {
  user: AdminLoginUserProfile | null;
  token: string | null;
  isInitialized: boolean;
  login: (user: AdminLoginUserProfile, token: string | null) => void;
  setAuth: (user: AdminLoginUserProfile, token: string | null) => void;
  hydrate: () => void;
  logout: () => void;
};

const normalizeRoles = (roles: any[]) => {
  return roles.map((r) => ({
    ...r,
    role: r.role ?? r.role_code,
    role_code: r.role ?? r.role_code,
  }));
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isInitialized: false,

      login: (user, token) => {
        const normalizedUser = {
          ...user,
          roles: normalizeRoles(user.roles || []),
        };

        set({ user: normalizedUser, token, isInitialized: true });
      },

      setAuth: (user, token) => {
        const normalizedUser = {
          ...user,
          roles: normalizeRoles(user.roles || []),
        };

        set({ user: normalizedUser, token, isInitialized: true });
      },

      hydrate: () => {
        set((state) => ({ ...state, isInitialized: true }));
      },

      logout: () => {
        set({ user: null, token: null, isInitialized: true });
      },
    }),
    {
      name: SESSION_STORAGE.ACCOUNT_CMS,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isInitialized = true;
        }
      },
    },
  ),
);
