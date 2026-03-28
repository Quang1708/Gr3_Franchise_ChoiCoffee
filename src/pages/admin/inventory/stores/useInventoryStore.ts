/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from 'react-toastify';
import { create } from "zustand";
import { inventoryService } from "../services/inventory.service";
import type { Inventory } from "../models/inventory.model";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { handleApiError } from "@/utils/handleApiError";

type InventoryState = {
  items: Inventory[];
  logs: any[];
  loading: boolean;
  logsLoading: boolean;

  fetchAll: () => Promise<void>;
  searchInventory: (params?: {
  keyword?: string;
  franchiseId?: string;
}) => Promise<void>;
  create: (data: any) => Promise<void>;
  delete: (id: string) => Promise<void>;
  restore: (id: string) => Promise<void>;
  adjust: (data: any) => Promise<void>;
  adjustBulk: (data: any) => Promise<void>;
  fetchLogs: (inventoryId: string) => Promise<void>
};

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],
  logs: [],
  loading: false,
  logsLoading: false,

  fetchAll: async () => {
    try {
      set({ loading: true });

      const selectedFranchiseId =
        useAdminContextStore.getState().selectedFranchiseId;
      const franchiseId =
        selectedFranchiseId && selectedFranchiseId !== "ALL"
          ? String(selectedFranchiseId)
          : null;

      const res = await inventoryService.search({
        searchCondition: {
          is_deleted: "",
          ...(franchiseId ? { franchise_id: franchiseId } : {}),
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
searchInventory: async (params = {}) => {
  const {  franchiseId = "" } = params;

  try {
    set({ loading: true });

    const selectedFranchiseId =
      useAdminContextStore.getState().selectedFranchiseId;

    const finalFranchiseId =
      franchiseId && franchiseId !== "ALL"
        ? franchiseId
        : selectedFranchiseId && selectedFranchiseId !== "ALL"
        ? String(selectedFranchiseId)
        : null;

    const res = await inventoryService.search({
      searchCondition: {
        is_deleted: false,

        ...(finalFranchiseId
          ? { franchise_id: finalFranchiseId }
          : {}),
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
    set({ loading: false });
  }
},
  /**
   * CREATE
   * nếu tồn tại → restore
   */

create: async (data) => {
  try {
    await inventoryService.create(data);

    toast.success("Inventory created successfully");

  } catch (err: any) {
  if (err?.message === "Inventory already exists for this product franchise") {
    const res = await inventoryService.search({
      searchCondition: {
        product_franchise_id: data.product_franchise_id,
        is_deleted: true,
      },
      pageInfo: { pageNum: 1, pageSize: 10 },
    });

    const exist = res?.data?.data?.[0];

    if (exist) {
      await inventoryService.restore(exist.id);
      toast.success("Inventory restored successfully");
      return;
    }
  }

  handleApiError(err);
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

  adjustBulk: async (data) => {
  try {
    await inventoryService.adjustBulk(data);
    toast.success("Inventory updated");
  } catch (err) {
    console.error(err);
    toast.error("Bulk update failed");
  }
},

  fetchLogs: async (inventoryId) => {
  try {
    set({ logsLoading: true })

    const res = await inventoryService.getLogs(inventoryId)

    set({
      logs: res?.data?.data ?? [],
      logsLoading: false
    })

  } catch (err) {
    console.error(err)
    set({ logs: [], logsLoading: false })
  }
}
}));