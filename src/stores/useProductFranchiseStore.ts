import { create } from "zustand";
import { productFranchiseApi } from "../api/productFranchise.api";
import type { PageInfo, ProductFranchise } from "@/models/product_franchise.model";

interface State {
  items: ProductFranchise[];
  pageInfo?: PageInfo;
  loading: boolean;
  error?: string;

  fetchByFranchise: (id: string, page?: number) => Promise<void>;
  add: (payload: {
    franchise_id: string;
    product_id: string;
    size: string;
    price_base: number;
  }) => Promise<void>;
}

export const useProductFranchiseStore = create<State>((set, get) => ({
  items: [],
  loading: false,

  fetchByFranchise: async (id, page = 1) => {
    try {
      set({ loading: true });
      const { items, pageInfo } =
        await productFranchiseApi.getByFranchise(id, page);

      set({ items, pageInfo, loading: false });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  add: async (payload) => {
    try {
      const newItem = await productFranchiseApi.add(payload);
      set({ items: [newItem, ...get().items] });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));