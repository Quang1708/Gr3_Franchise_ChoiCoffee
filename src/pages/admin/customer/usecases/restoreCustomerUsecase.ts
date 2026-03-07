import { restoreCustomerService } from "@/pages/admin/customer/services/customer07.service";

export const restoreCustomerUsecase = async (id: string | number) => {
    return await restoreCustomerService(id);
};