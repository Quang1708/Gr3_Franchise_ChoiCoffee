/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import { franchiseService } from "../services/franchise.service"
import type { Franchise } from "../models/franchise.model"

type FranchiseState = {
  items: Franchise[]
  loading: boolean
  actionLoading: boolean
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
  actionLoading: false, 

  fetchAll: async () => {
    set({ loading: true });
    try {
      const data = await franchiseService.search();
      set({ items: data });
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    set({ actionLoading: true });
    try {
      const newItem = await franchiseService.create(payload);
      set((state) => ({
        items: [newItem, ...state.items],
      }));
    } finally {
      set({ actionLoading: false });
    }
  },

  update: async (id, payload) => {
    set({ actionLoading: true });
    try {
      const updated = await franchiseService.update(id, payload);
      set((state) => ({
        items: state.items.map((i) => (i.id === id ? updated : i)),
      }));
    } finally {
      set({ actionLoading: false });
    }
  },

  delete: async (id) => {
    set({ actionLoading: true });
    try {
      await franchiseService.delete(id);
      set((state) => ({
        items: state.items.map((i) =>
          i.id === id
            ? { ...i, is_deleted: true, isActive: false }
            : i,
        ),
      }));
    } finally {
      set({ actionLoading: false });
    }
  },

  restore: async (id) => {
    set({ actionLoading: true });
    try {
      await franchiseService.restore(id);
      set((state) => ({
        items: state.items.map((i) =>
          i.id === id
            ? { ...i, is_deleted: false, isActive: true }
            : i,
        ),
      }));
    } finally {
      set({ actionLoading: false });
    }
  },

  changeStatus: async (id, active) => {
    set({ actionLoading: true });
    try {
      await franchiseService.changeStatus(id, active);
      set((state) => ({
        items: state.items.map((i) =>
          i.id === id ? { ...i, isActive: active } : i,
        ),
      }));
    } finally {
      set({ actionLoading: false });
    }
  },

  search: async (keyword: string) => {
    set({ loading: true });
    try {
      const data = await franchiseService.searchFranchiseApi(keyword);
      set({ items: data });
      return data;
    } finally {
      set({ loading: false });
    }
  },
}));