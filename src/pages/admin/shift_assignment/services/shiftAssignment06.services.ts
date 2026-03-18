import { axiosAdminClient } from "@/api/axios.config";

export const shiftAssignment06Service = async (
  userId: string,
  date?: string,
) => {
  const res = await axiosAdminClient.get(
    `/api/shift-assignments/user/${userId}`,
    {
      params: date ? { date } : undefined,
    },
  );
  return res.data;
};
