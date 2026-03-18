import { axiosAdminClient } from "@/api/axios.config";

export const shiftAssignment04Service = async (id: string) => {
  const res = await axiosAdminClient.get(`/api/shift-assignments/${id}`);
  return res.data;
};
