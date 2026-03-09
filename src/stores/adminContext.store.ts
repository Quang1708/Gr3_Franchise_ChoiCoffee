import { create } from "zustand";
import { LOCAL_STORAGE } from "@/consts/localstorage.const";
import {
  getItemInLocalStorage,
  setItemInLocalStorage,
} from "@/utils/localStorage.util";

export type FranchiseOption = {
  id: string;
  code: string;
  name: string;
};

type AdminContextState = {
  selectedFranchiseId: string | "ALL" | null;
  franchises: FranchiseOption[];

  hydrate: () => void;
  setSelectedFranchiseId: (id: string | "ALL" | null) => void;
  setFranchises: (list: FranchiseOption[]) => void;
};

export const useAdminContextStore = create<AdminContextState>((set) => ({
  selectedFranchiseId: null,
  franchises: [],

  hydrate: () => {
    const saved = getItemInLocalStorage<string | number>(
      LOCAL_STORAGE.ADMIN_FRANCHISE_ID,
    );

    const ok = typeof saved === "string" || typeof saved === "number";

    set({
      selectedFranchiseId: ok ? String(saved) : null,
    });
  },

  setSelectedFranchiseId: (id) => {
    setItemInLocalStorage(LOCAL_STORAGE.ADMIN_FRANCHISE_ID, id);
    set({ selectedFranchiseId: id });
  },

  setFranchises: (list) => {
    set({ franchises: list });
  },
}));