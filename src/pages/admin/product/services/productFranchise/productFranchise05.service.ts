import { axiosAdminClient } from "@/api";

export const deleteProductFranchiseService = async (id: string | number) => {
    const response = await axiosAdminClient.delete(`/api/product-franchises/${id}`);
    return response.data;
};