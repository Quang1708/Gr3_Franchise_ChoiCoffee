import { axiosAdminClient } from "@/api";

export const deleteCategoryService = async (id: string | number) => {
  const res = await axiosAdminClient.delete<{
    success: boolean;
    data: null;
    message?: string;
  }>(`/api/categories/${id}`);

  return res.data;
};
