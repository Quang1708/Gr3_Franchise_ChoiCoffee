import { create } from "zustand";
import { LOCAL_STORAGE } from "@/consts/localstorage.const";
import type { AdminLoginUserProfile } from "@/pages/admin/auth/login/models/api.model";
import {
  getItemInLocalStorage,
  removeItemInLocalStorage,
  setItemInLocalStorage,
} from "@/utils/localStorage.util";
import { SESSION_STORAGE } from "@/consts/sessionstorage.const";
import {
  removeItemInSessionStorage,
  setItemInSessionStorage,
} from "@/utils/sessionStorage.util";

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
    // lưu đúng key để AdminGuard đọc được
    setItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_CMS, user);
    setItemInLocalStorage(LOCAL_STORAGE.CMS_TOKEN, token);
    if (token && token !== "SESSION") {
      setItemInSessionStorage(SESSION_STORAGE.ACCESS_TOKEN, token);
    } else {
      removeItemInSessionStorage(SESSION_STORAGE.ACCESS_TOKEN);
    }
    set({ user, token, isInitialized: true });
  },

  setAuth: (user, token) => {
    setItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_CMS, user);
    setItemInLocalStorage(LOCAL_STORAGE.CMS_TOKEN, token);
    if (token && token !== "SESSION") {
      setItemInSessionStorage(SESSION_STORAGE.ACCESS_TOKEN, token);
    } else {
      removeItemInSessionStorage(SESSION_STORAGE.ACCESS_TOKEN);
    }
    set({ user, token, isInitialized: true });
  },

  hydrate: () => {
    const user = getItemInLocalStorage<AdminLoginUserProfile>(
      LOCAL_STORAGE.ACCOUNT_CMS,
    );
    const token = getItemInLocalStorage<string>(LOCAL_STORAGE.CMS_TOKEN);
    set({ user: user ?? null, token: token ?? null, isInitialized: true });
  },

  logout: () => {
    removeItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_CMS);
    removeItemInLocalStorage(LOCAL_STORAGE.CMS_TOKEN);
    removeItemInLocalStorage(LOCAL_STORAGE.ADMIN_FRANCHISE_ID);
    removeItemInLocalStorage(LOCAL_STORAGE.ADMIN_CONTEXT_REQUIRED);
    removeItemInSessionStorage(SESSION_STORAGE.ACCESS_TOKEN);
    set({ user: null, token: null, isInitialized: true });
  },
}));
