import { axiosAdminClient } from "@/api";

export const getProductFranchiseByFranchiseId = async (franchiseId: string) => {
    try{
        const res = await axiosAdminClient.get(`/api/product-franchises/franchise/${franchiseId}?onlyActive=true&productId=`);
        if(res){
            return res.data;
        }
    } catch (error) {
        console.error("Error fetching product franchise:", error);
        throw error;
    }
};