/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { inventoryService } from "../services/inventory.service";
import type { Inventory } from "../models/inventory.model";

type InventoryState = {
  items: Inventory[];
  loading: boolean;

  fetchAll: () => Promise<void>;
  create: (data: any) => Promise<void>;
  delete: (id: string) => Promise<void>;
  restore: (id: string) => Promise<void>;
  adjust: (data: any) => Promise<void>;
};

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],
  loading: false,

  fetchAll: async () => {
    try {
      set({ loading: true });

      const res = await inventoryService.search({
        searchCondition: {
          is_deleted: false,
        },
        pageInfo: {
          pageNum: 1,
          pageSize: 100,
        },
      });

      set({
        items: res?.data?.data ?? [],
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ items: [], loading: false });
    }
  },

  /**
   * CREATE
   * nếu tồn tại → restore
   */

create: async (data) => {
  try {
    await inventoryService.create(data);
    return;
  } catch (err: any) {

    const message = err?.response?.data?.message;

    if (message === "Inventory already exists for this product franchise") {

      console.log("Duplicate inventory -> restoring");

      // gọi API search KHÔNG filter
      const res = await inventoryService.search({
        searchCondition: {},
        pageInfo: { pageNum: 1, pageSize: 100 }
      });

      const exist = res.data.data.find(
        (i: any) => i.product_franchise_id === data.product_franchise_id
      );

      if (exist) {
        await inventoryService.restore(exist.id);
        return;
      }
    }

    throw err;
  }
},
  delete: async (id) => {
    await inventoryService.delete(id);
  },

  restore: async (id) => {
    await inventoryService.restore(id);
  },

  adjust: async (data) => {
    await inventoryService.adjust(data);
  },
}));