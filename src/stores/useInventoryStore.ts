import { create } from "zustand";
import { inventoryApi } from "../api/inventory.api";
import type { Inventory } from "@/models/inventory.model";

interface State {
  items: Inventory[];
  loading: boolean;
  error?: string;

  fetchByFranchise: (id: string) => Promise<void>;
}

export const useInventoryStore = create<State>((set) => ({
  items: [],
  loading: false,

  fetchByFranchise: async (id) => {
    try {
      set({ loading: true });
      const data = await inventoryApi.getByFranchise(id);
      set({ items: data, loading: false });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));