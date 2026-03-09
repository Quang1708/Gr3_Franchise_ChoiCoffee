/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import { inventoryService } from "../services/inventory.service"
import type { Inventory } from "../models/inventory.model"

type InventoryState = {

  items: Inventory[]
  loading: boolean

  fetchAll: () => Promise<void>

  create: (data: any) => Promise<void>
  delete: (id: string) => Promise<void>
  restore: (id: string) => Promise<void>
  adjust: (data: any) => Promise<void>
}

export const useInventoryStore = create<InventoryState>((set) => ({

  items: [],
  loading: false,

fetchAll: async () => {
  try {
    set({ loading: true })

    const res = await inventoryService.search({
      searchCondition: {
        is_deleted: false
      },
      pageInfo: {
        pageNum: 1,
        pageSize: 100
      }
    })

    set({
      items: res?.data?.data ?? [],
      loading: false
    })

  } catch (err) {
    console.error(err)

    set({
      items: [],
      loading: false
    })
  }
},
  create: async (data) => {
    await inventoryService.create(data)
  },

  delete: async (id) => {
    await inventoryService.delete(id)
  },

  restore: async (id) => {
    await inventoryService.restore(id)
  },

  adjust: async (data) => {
    await inventoryService.adjust(data)
  }

}))