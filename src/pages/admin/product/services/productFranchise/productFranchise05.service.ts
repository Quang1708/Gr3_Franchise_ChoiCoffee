import { axiosAdminClient } from "@/api";

export const deleteProductFranchiseService = async (product_franchise_id: string | number) => {
    const response = await axiosAdminClient.delete(`/api/product-franchises/${product_franchise_id}`);
    return response.data;
};