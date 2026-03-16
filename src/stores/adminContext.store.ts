import { create } from "zustand";
import { LOCAL_STORAGE } from "@/consts/localstorage.const";
import {
  getItemInLocalStorage,
  removeItemInLocalStorage,
  setItemInLocalStorage,
} from "@/utils/localStorage.util";

export type FranchiseOption = {
  id: string;
  code: string;
  name: string;
};

type AdminContextState = {
  selectedFranchiseId: string | null;
  franchises: FranchiseOption[];

  hydrate: () => void;
  setSelectedFranchiseId: (id: string | null | undefined) => void;
  setFranchises: (list: FranchiseOption[]) => void;
};

export const useAdminContextStore = create<AdminContextState>((set) => ({
  selectedFranchiseId: null,
  franchises: [],

  /**
   * Load context từ localStorage khi app start
   */
  hydrate: () => {
    const saved = getItemInLocalStorage<string | number>(
      LOCAL_STORAGE.ADMIN_FRANCHISE_ID,
    );

    if (!saved) {
      set({ selectedFranchiseId: null });
      return;
    }

    if (String(saved) === "ALL") {
      removeItemInLocalStorage(LOCAL_STORAGE.ADMIN_FRANCHISE_ID);
      set({ selectedFranchiseId: null });
      return;
    }

    set({
      selectedFranchiseId: String(saved),
    });
  },

  /**
   * Update franchise context
   */
  setSelectedFranchiseId: (id) => {
    if (id === null) {
      removeItemInLocalStorage(LOCAL_STORAGE.ADMIN_FRANCHISE_ID);
      set({ selectedFranchiseId: null });
      return;
    }
    setItemInLocalStorage(LOCAL_STORAGE.ADMIN_FRANCHISE_ID, id);
    set({ selectedFranchiseId: String(id) });
  },

  /**
   * Update franchise list
   */
  setFranchises: (list) => {
    set({ franchises: list });
  },
}));