/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import { franchiseService } from "../services/franchise.service"
import type { Franchise } from "../models/franchise.model"

type FranchiseState = {
  items: Franchise[]
  loading: boolean

  fetchAll: () => Promise<void>

  create: (payload: any) => Promise<void>
  update: (id: string, payload: any) => Promise<void>

  delete: (id: string) => Promise<void>
  restore: (id: string) => Promise<void>

  changeStatus: (id: string, active: boolean) => Promise<void>

  search: (keyword: string) =>  Promise<Franchise[]>
}

export const useFranchiseStore = create<FranchiseState>((set) => ({

  items: [],
  loading: false,

  fetchAll: async () => {

    set({ loading: true })

    try {

      const data = await franchiseService.search()

      set({
        items: data
      })

    } finally {

      set({ loading: false })

    }
  },

  create: async (payload) => {

    const newItem = await franchiseService.create(payload)

    set((state) => ({
      items: [newItem, ...state.items]
    }))
  },

  update: async (id, payload) => {

    const updated = await franchiseService.update(id, payload)

    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? updated : i
      )
    }))
  },

delete: async (id) => {

  await franchiseService.delete(id)

  set((state) => ({
    items: state.items.map((i) =>
      i.id === id
        ? { ...i, is_deleted: true, isActive: false }
        : i
    )
  }))
},

restore: async (id) => {

  await franchiseService.restore(id)

  set((state) => ({
    items: state.items.map((i) =>
      i.id === id
        ? { ...i, isDeleted: false }
        : i
    )
  }))
},

  changeStatus: async (id, active) => {

    await franchiseService.changeStatus(id, active)

    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, isActive: active } : i
      )
    }))
  },

  search: async (keyword: string) => {
  set({ loading: true });

try {

    const data = await franchiseService.searchFranchiseApi(keyword)

    set({
      items: data
    })

    return data  

  } finally {

    set({ loading: false })

  }
},

}))