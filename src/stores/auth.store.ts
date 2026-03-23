import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminLoginUserProfile } from "@/pages/admin/auth/login/models/api.model";
import { LOCAL_STORAGE } from "@/consts/localstorage.const";
import { ENV } from "@/config";
import axios from "axios";

type AuthState = {
  user: AdminLoginUserProfile | null;
  token: string | null;
  isInitialized: boolean;
  login: (user: AdminLoginUserProfile, token: string) => void;
  setAuth: (user: AdminLoginUserProfile, token: string) => void;
  hydrate: () => void;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
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

      refreshAccessToken: async () => {
        await axios.get(`${ENV.API_URL}/api/auth/refresh-token`, {
          withCredentials: true,
          timeout: 300000,
        });
      },
    }),
    {
      name: LOCAL_STORAGE.ACCOUNT_CMS,
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isInitialized = true;
        }
      },
    },
  ),
);
