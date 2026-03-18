import { axiosAdminClient } from "@/api/axios.config";

export const shiftAssignment07Service = async (franchiseId: string) => {
  const res = await axiosAdminClient.get(
    `/api/shift-assignments/franchise/${franchiseId}`,
  );
  return res.data;
};
