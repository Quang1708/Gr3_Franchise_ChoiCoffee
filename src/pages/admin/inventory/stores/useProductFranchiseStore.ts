import { create } from "zustand"
import { productFranchiseService } from "../services/productFranchise.service"

type ProductFranchise = {
  id: string
  product_name: string
  size: string
  productId: string
  franchiseId: string
}

type ProductFranchiseState = {

  items: ProductFranchise[]
  loading: boolean

  fetchByFranchise: (franchiseId: string) => Promise<void>

}

export const useProductFranchiseStore =
  create<ProductFranchiseState>((set) => ({

    items: [],
    loading: false,

    fetchByFranchise: async (franchiseId) => {

      set({ loading: true })

      const res =
        await productFranchiseService.getByFranchise(
          franchiseId,
          true
        )

      set({
        items: res.data ?? [],
        loading: false
      })
    }

  }))