import { axiosAdminClient } from "@/api";

export const restoreProductFranchiseService = async (id: string | number) => {
    const res = await axiosAdminClient.patch(`/api/product-franchises/${id}/restore`);
    return res.data;
};