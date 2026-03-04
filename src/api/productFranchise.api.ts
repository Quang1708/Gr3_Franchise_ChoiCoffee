import type { ProductFranchise } from "@/models/product_franchise.model";
import { axiosAdminClient } from "./axios.config";


const BASE = "/api/product-franchises";

export const productFranchiseApi = {
  async getByFranchise(franchiseId: string): Promise<ProductFranchise[]> {
    const res = await axiosAdminClient.get<ProductFranchise[]>(
      BASE,
      {
        params: { franchise_id: franchiseId },
      },
    );
    return res.data;
  },

  async create(payload: Partial<ProductFranchise>) {
    const res = await axiosAdminClient.post(BASE, payload);
    return res.data;
  },

  async update(id: string, payload: Partial<ProductFranchise>) {
    const res = await axiosAdminClient.put(`${BASE}/${id}`, payload);
    return res.data;
  },

  async delete(id: string) {
    const res = await axiosAdminClient.delete(`${BASE}/${id}`);
    return res.data;
  },
};