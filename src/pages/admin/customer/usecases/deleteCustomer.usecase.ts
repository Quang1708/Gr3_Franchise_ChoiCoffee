import { deleteCustomerService } from "../services/customer06.service";

export const deleteCustomerUsecase = async (id: string | number) => {
    return await deleteCustomerService(id);
};