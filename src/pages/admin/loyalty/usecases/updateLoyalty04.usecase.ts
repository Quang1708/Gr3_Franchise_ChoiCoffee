import type { UpdateLoyaltyRuleRequest } from "@/pages/admin/loyalty/models/updateLoyaltyRequest.model";
import { updateLoyaltyService } from "@/pages/admin/loyalty/services/loyaltyRule04.service";

export const updateLoyaltyUsecase = async (
    id: string,
    payload: UpdateLoyaltyRuleRequest
) => {
    try {
        return await updateLoyaltyService(id, payload);
    } catch (error) {
        console.error("Update Loyalty Error:", error);
        throw error;
    }
};