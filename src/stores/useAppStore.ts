import { create } from "zustand";
import { useFranchiseStore } from "./useFranchiseStore";

interface AppState {
  initialized: boolean;
  initializing: boolean;
  initApp: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  initialized: false,
  initializing: false,

  initApp: async () => {
    try {
      set({ initializing: true });

      await useFranchiseStore.getState().fetchAll();

      set({ initialized: true, initializing: false });
    } catch {
      set({ initializing: false });
    }
  },
}));