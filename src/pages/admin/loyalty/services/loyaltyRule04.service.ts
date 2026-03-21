import { axiosAdminClient } from "@/api";
import type { UpdateLoyaltyRuleRequest } from "@/pages/admin/loyalty/models/updateLoyaltyRequest.model";

export const updateLoyaltyService = async (
    id: string,
    payload: UpdateLoyaltyRuleRequest
) => {
    const response = await axiosAdminClient.put(
        `/api/loyalty-rules/${id}`,
        payload
    );
    return response.data;
};