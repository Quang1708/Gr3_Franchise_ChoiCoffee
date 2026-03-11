import type { CustomerRequest } from "../models/customerRequest.model";
import { createCustomerService } from "../services/customer02.service";

export const createCustomerUsecase = async (payload: CustomerRequest) => {
    try {
        const res = await createCustomerService(payload);
        return res; 
    } catch (error) {
        console.error("Create Customer Usecase Error:", error);
        return { success: false, data: null };
    }
};