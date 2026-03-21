import { getLoyaltyDetailService } from "@/pages/admin/loyalty/services/loyaltyRule03.service";

export const getLoyaltyDetailUsecase = async (id: string | number) => {
    try {
        const res = await getLoyaltyDetailService(id);
        return res;
    } catch (error) {
        console.error("Get Loyalty Detail Error:", error);
        throw error;
    }
};