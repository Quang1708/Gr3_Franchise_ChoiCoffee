import type { Inventory } from "@/models/inventory.model";
import { axiosAdminClient } from "./axios.config";


const BASE = "/api/inventories";

export const inventoryApi = {
  async getByFranchise(franchiseId: string): Promise<Inventory[]> {
    const res = await axiosAdminClient.get<Inventory[]>(
      BASE,
      {
        params: { franchise_id: franchiseId },
      },
    );
    return res.data;
  },

  async update(id: string, payload: Partial<Inventory>) {
    const res = await axiosAdminClient.put(`${BASE}/${id}`, payload);
    return res.data;
  },
};