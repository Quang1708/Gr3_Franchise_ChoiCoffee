import type { UpdateCustomerProfileRequest } from "@/models";
import { updateCustomerProfile } from "@/pages/client/account/partial/service";

export const updateCustomerUsecase = async (
    id: string | number, 
    data: UpdateCustomerProfileRequest
) => {
    return await updateCustomerProfile(String(id), data);
};