import { axiosAdminClient } from "@/api";

export const changeStatusProductFranchiseService = async (
    product_franchise_id: string | number, 
    is_active: boolean
) => {
    if (!product_franchise_id) throw new Error("Missing Product Franchise ID");

    const res = await axiosAdminClient.patch(`/api/product-franchises/${String(product_franchise_id)}/status`, {
        is_active,
    });

    return res.data;
};