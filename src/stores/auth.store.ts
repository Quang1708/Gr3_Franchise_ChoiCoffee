import { create } from "zustand";
import { LOCAL_STORAGE } from "../consts/localstorage.const";
import { getItemInLocalStorage, setItemInLocalStorage, removeItemInLocalStorage } from "../utils/localStorage.util";
import type { User } from "../models/user.model";

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isInitialized: boolean;

  login: (user: User) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isInitialized: false,

  login: (user) => {
    setItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_ADMIN, user);
    set({ user, isLoggedIn: true });
  },

  logout: () => {
    removeItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_ADMIN);
    set({ user: null, isLoggedIn: false });
  },

  hydrate: () => {
    const user = getItemInLocalStorage<User>(LOCAL_STORAGE.ACCOUNT_ADMIN);
    if (user) {
      set({ user, isLoggedIn: true, isInitialized: true });
    } else {
      set({ isInitialized: true });
    }
  },
}));
