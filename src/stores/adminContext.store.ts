import { create } from "zustand";
import { SESSION_STORAGE } from "@/consts/sessionstorage.const";
import {
  getItemInSessionStorage,
  removeItemInSessionStorage,
  setItemInSessionStorage,
} from "@/utils/sessionStorage.util";

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
   * Load context từ sessionStorage khi app start
   */
  hydrate: () => {
    const saved = getItemInSessionStorage<string | number>(
      SESSION_STORAGE.FRANCHISE_ID,
    );

    if (!saved) {
      set({ selectedFranchiseId: null });
      return;
    }

    const savedText = String(saved).trim().toLowerCase();
    if (savedText === "all") {
      removeItemInSessionStorage(SESSION_STORAGE.FRANCHISE_ID);
      set({ selectedFranchiseId: null });
      return;
    }

    if (savedText === "null" || savedText === "undefined") {
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
      setItemInSessionStorage(SESSION_STORAGE.FRANCHISE_ID, "null");
      set({ selectedFranchiseId: null });
      return;
    }
    setItemInSessionStorage(SESSION_STORAGE.FRANCHISE_ID, id);
    set({ selectedFranchiseId: String(id) });
  },

  /**
   * Update franchise list
   */
  setFranchises: (list) => {
    set({ franchises: list });
  },
}));