import { axiosAdminClient } from "@/api";

export type RoleSelectItem = {
  value: string;
  code: string;
  name: string;
  scope: string;
};

export const getRoleSelectService = async () => {
  const res = await axiosAdminClient.get<{
    success: boolean;
    data: RoleSelectItem[];
    message?: string;
  }>("/api/roles/select");

  return res.data;
};
