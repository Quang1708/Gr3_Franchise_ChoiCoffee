import { axiosAdminClient } from "@/api";

export const getProductFranchiseService = async (id: string) => {
    const response = await axiosAdminClient.get(`/api/product-franchises/${id}`);
    return response.data;
};