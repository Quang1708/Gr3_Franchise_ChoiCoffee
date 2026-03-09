import { create } from "zustand";
import { franchiseApi } from "../api/franchise.api";
import type { Franchise } from "@/models/franchise.model";

interface FranchiseState {
  items: Franchise[];
  selectedId?: string;
  loading: boolean;
  error?: string;

  fetchAll: () => Promise<void>;
  setSelected: (id: string) => void;
}

export const useFranchiseStore = create<FranchiseState>((set) => ({
  items: [],
  loading: false,

  fetchAll: async () => {
    try {
      set({ loading: true });
      const data = await franchiseApi.getAll();
      set({ items: data, loading: false });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  setSelected: (id) => set({ selectedId: id }),
}));