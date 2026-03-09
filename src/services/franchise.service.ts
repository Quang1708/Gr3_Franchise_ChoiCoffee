import { axiosAdminClient } from "@/api";


export type FranchiseSelectItem = {
  value: string;
  code: string;
  name: string;
};

export const franchiseService = {
  async getAllSelect(): Promise<FranchiseSelectItem[]> {
    const res = await axiosAdminClient.get("/api/franchises/select");
    return res.data?.data ?? [];
  },
};