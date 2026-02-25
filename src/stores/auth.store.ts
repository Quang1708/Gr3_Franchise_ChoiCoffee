import { create } from "zustand";
import { LOCAL_STORAGE } from "@/consts/localstorage.const";
import {
  getItemInLocalStorage,
  removeItemInLocalStorage,
  setItemInLocalStorage,
} from "@/utils/localStorage.util";

type AuthState = {
  user: any;
  token: string | null;
  isInitialized: boolean;

  // ✅ dùng cho login page
  login: (user: any, token: string) => void;

  // ✅ nội bộ
  setAuth: (user: any, token: string) => void;
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
    set({ user, token, isInitialized: true });
  },

  setAuth: (user, token) => {
    setItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_CMS, user);
    setItemInLocalStorage(LOCAL_STORAGE.CMS_TOKEN, token);
    set({ user, token, isInitialized: true });
  },

  hydrate: () => {
    const user = getItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_CMS);
    const token = getItemInLocalStorage(LOCAL_STORAGE.CMS_TOKEN);
    set({ user: user ?? null, token: token ?? null, isInitialized: true });
  },

  logout: () => {
    removeItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_CMS);
    removeItemInLocalStorage(LOCAL_STORAGE.CMS_TOKEN);
    removeItemInLocalStorage(LOCAL_STORAGE.ADMIN_FRANCHISE_ID);
    set({ user: null, token: null, isInitialized: true });
  },
}));