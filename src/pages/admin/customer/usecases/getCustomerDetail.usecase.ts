import { getCustomerDetailService } from "@/pages/admin/customer/services/customer04.service";

export const getCustomerDetailUsecase = async (id: string | number) => {
    try {
        const res = await getCustomerDetailService(id);
        return res;
    } catch (error) {
        console.error("Get Detail Error:", error);
        throw error;
    }
};