import { createCustomerService } from "../services/customer02.service";
import type { RequestCustomer } from "../models/requestCustomer.model";

export const createCustomerUsecase = async (payload: RequestCustomer) => {
    try {
        const res = await createCustomerService(payload);
        return res;
    } catch (error) {
        console.error("Create Customer Usecase Error:", error);
        throw error;
    }
};