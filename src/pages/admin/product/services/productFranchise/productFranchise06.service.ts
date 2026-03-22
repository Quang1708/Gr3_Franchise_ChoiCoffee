import { axiosAdminClient } from "@/api";

export const restoreProductFranchiseService = async (product_franchise_id: string | number) => {
    const res = await axiosAdminClient.patch(`/api/product-franchises/${product_franchise_id}/restore`);
    return res.data;
};