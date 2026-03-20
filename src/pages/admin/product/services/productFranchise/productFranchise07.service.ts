import { axiosAdminClient } from "@/api";

export const changeStatusProductFranchiseService = async (
    id: string | number, 
    is_active: boolean
) => {
    if (!id) throw new Error("Missing Customer ID");

    const res = await axiosAdminClient.patch(`/api/product-franchises/${String(id)}/status`, {
        is_active,
    });

    return res.data;
};