import { axiosAdminClient } from "@/api"

export const getFranchise = async (id: string) => {
    const response = await axiosAdminClient.get(`/api/franchises/${id}`);
    
    return response.data;
}