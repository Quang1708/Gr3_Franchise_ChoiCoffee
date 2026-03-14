import { create } from "zustand";
import type { AdminLoginUserProfile } from "@/pages/admin/auth/login/models/api.model";

type AuthState = {
  user: AdminLoginUserProfile | null;
  token: string | null;
  isInitialized: boolean;

  // ✅ dùng cho login page
  login: (user: AdminLoginUserProfile, token: string) => void;

  // ✅ nội bộ
  setAuth: (user: AdminLoginUserProfile, token: string) => void;
  hydrate: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
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
    set({ user: null, token: null, isInitialized: true });
  },

  logout: () => {
    set({ user: null, token: null, isInitialized: true });
  },
}));
