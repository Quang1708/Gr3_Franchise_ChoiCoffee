import { updateCustomerStatusService } from "@/pages/admin/customer/services/customer08.service";

export const updateCustomerStatusUsecase = async (
    id: string,
    is_active: boolean
) => {
    return await updateCustomerStatusService(id, is_active);
};