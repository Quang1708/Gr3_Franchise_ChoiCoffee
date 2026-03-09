import { create } from "zustand"
import { categoryFranchiseService } from "../services/categoryFranchise.service"

type CategoryFranchise = {
  id: string
  name: string
  franchiseId: string
}

type CategoryFranchiseState = {

  items: CategoryFranchise[]
  loading: boolean

  fetchByFranchise: (franchiseId: string) => Promise<void>

}

export const useCategoryFranchiseStore =
  create<CategoryFranchiseState>((set) => ({

    items: [],
    loading: false,

    fetchByFranchise: async (franchiseId) => {

      set({ loading: true })

      const res =
        await categoryFranchiseService.getByFranchise(
          franchiseId,
          true
        )

      set({
        items: res.data ?? [],
        loading: false
      })
    }

  }))