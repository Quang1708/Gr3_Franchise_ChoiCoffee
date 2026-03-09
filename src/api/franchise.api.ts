import type { Franchise } from "@/models/franchise.model";
import { axiosAdminClient } from "./axios.config";

const BASE = "/api/franchises";

export const franchiseApi = {
  async getAll(): Promise<Franchise[]> {
    const res = await axiosAdminClient.get<Franchise[]>(BASE);
    return res.data;
  },

  async getById(id: string): Promise<Franchise> {
    const res = await axiosAdminClient.get<Franchise>(`${BASE}/${id}`);
    return res.data;
  },

  async create(payload: Partial<Franchise>) {
    const res = await axiosAdminClient.post(BASE, payload);
    return res.data;
  },

  async update(id: string, payload: Partial<Franchise>) {
    const res = await axiosAdminClient.put(`${BASE}/${id}`, payload);
    return res.data;
  },

  async delete(id: string) {
    const res = await axiosAdminClient.delete(`${BASE}/${id}`);
    return res.data;
  },
};