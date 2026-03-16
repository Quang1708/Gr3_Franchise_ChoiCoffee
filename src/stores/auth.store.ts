import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminLoginUserProfile } from "@/pages/admin/auth/login/models/api.model";
import { LOCAL_STORAGE } from "@/consts/localstorage.const";

type AuthState = {
  user: AdminLoginUserProfile | null;
  token: string | null;
  isInitialized: boolean;
  login: (user: AdminLoginUserProfile, token: string) => void;
  setAuth: (user: AdminLoginUserProfile, token: string) => void;
  hydrate: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isInitialized: false,

      login: (user, token) => {
        set({ user, token, isInitialized: true });
      },

      setAuth: (user, token) => {
        set({ user, token, isInitialized: true });
      },

      hydrate: () => {
        set((state) => ({ ...state, isInitialized: true }));
      },

      logout: () => {
        set({ user: null, token: null, isInitialized: true });
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
