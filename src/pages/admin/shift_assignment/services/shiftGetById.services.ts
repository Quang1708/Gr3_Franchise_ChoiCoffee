import { axiosAdminClient } from "@/api/axios.config";

export const shiftGetByIdService = async (shiftId: string) => {
  const res = await axiosAdminClient.get(`/api/shifts/${shiftId}`);
  return res.data;
};
