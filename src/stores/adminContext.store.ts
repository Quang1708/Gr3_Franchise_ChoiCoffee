import { create } from "zustand";
import { LOCAL_STORAGE } from "@/consts/localstorage.const";
import {
  getItemInLocalStorage,
  setItemInLocalStorage,
} from "@/utils/localStorage.util";

type AdminContextState = {
  selectedFranchiseId: number | null;
  hydrate: () => void;
  setSelectedFranchiseId: (id: number | null) => void;
};

/**
 * Admin CMS context (tạm, vì chưa có API)
 * - selectedFranchiseId: franchise đang chọn, áp dụng cho toàn bộ trang admin
 */
export const useAdminContextStore = create<AdminContextState>((set) => ({
  selectedFranchiseId: null,

  hydrate: () => {
    const saved = getItemInLocalStorage<number>(LOCAL_STORAGE.ADMIN_FRANCHISE_ID);
    set({ selectedFranchiseId: typeof saved === "number" ? saved : null });
  },

  setSelectedFranchiseId: (id) => {
    setItemInLocalStorage(LOCAL_STORAGE.ADMIN_FRANCHISE_ID, id);
    set({ selectedFranchiseId: id });
  },
}));