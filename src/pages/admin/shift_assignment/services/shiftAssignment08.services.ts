import { axiosAdminClient } from "@/api/axios.config";

export const shiftAssignment08Service = async (shiftId: string) => {
  const res = await axiosAdminClient.get(
    `/api/shift-assignments/shift/${shiftId}`,
  );
  return res.data;
};
