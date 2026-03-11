import type { SearchCustomerRequest } from "@/pages/admin/customer/models/searchCustomerRequest.model";
import { searchCustomersApi } from "../services/customer03.service";

export const searchCustomersUsecase = async (payload: SearchCustomerRequest) => {
    return await searchCustomersApi(payload);
};