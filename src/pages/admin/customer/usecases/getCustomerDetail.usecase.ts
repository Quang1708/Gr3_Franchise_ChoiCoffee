import { getCustomerDetailService } from "@/pages/admin/customer/services/customer04.service";

export const getCustomerDetailUsecase = async (id: string | number) => {
    try {
        const res = await getCustomerDetailService(id);
        if (!res.success) throw new Error();
        return res.data;
    } catch (error) {
        console.error(error);
        return null;
    }
};