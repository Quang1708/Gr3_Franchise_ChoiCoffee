import { createLoyaltyService } from "@/pages/admin/loyalty/services/loyaltyRule01.service";
import type { CreateLoyaltyRequest } from "../models/createLoyaltyRequest.model";

export const createLoyaltyUsecase = async (payload: CreateLoyaltyRequest) => {
    try {
        const res = await createLoyaltyService(payload);
        return res;
    } catch (error) {
        console.error("Create Loyalty Error:", error);
        throw error;
    }
};