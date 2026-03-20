import { axiosAdminClient } from "@/api";
import type { GetLoyaltyResponse } from "@/pages/admin/loyalty/models/getLoyaltyResponse.model";

export const getLoyaltyDetailService = async (id: string | number) => {
    const response = await axiosAdminClient.get<GetLoyaltyResponse>(
        `/api/loyalty-rules/${id}`
    );
    return response.data;
};