/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { LOCAL_STORAGE } from "../consts/localstorage.const";
import { getItemInLocalStorage, setItemInLocalStorage, removeItemInLocalStorage } from "../utils/localStorage.util";

type AuthState = {
  user: any | null;
  token: string | null;
  isInitialized: boolean;
  hydrate: () => void;
  login: (user: any, token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isInitialized: false,

  hydrate: () => {
    const user = getItemInLocalStorage<any>(LOCAL_STORAGE.ACCOUNT_ADMIN);
    const token = getItemInLocalStorage<string>(LOCAL_STORAGE.ADMIN_TOKEN);
    set({ user: user ?? null, token: token ?? null, isInitialized: true });
  },

  login: (user, token) => {
    setItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_ADMIN, user);
    setItemInLocalStorage(LOCAL_STORAGE.ADMIN_TOKEN, token);
    set({ user, token, isInitialized: true });
  },

  logout: () => {
    removeItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_ADMIN);
    removeItemInLocalStorage(LOCAL_STORAGE.ADMIN_TOKEN);
    set({ user: null, token: null, isInitialized: true });
  },
}));
