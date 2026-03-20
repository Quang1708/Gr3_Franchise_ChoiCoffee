import { axiosAdminClient } from "@/api";
import type { CreateLoyaltyRequest } from "../models/createLoyaltyRequest.model";

export const createLoyaltyService = async (payload: CreateLoyaltyRequest) => {
    const response = await axiosAdminClient.post(
        `/api/loyalty-rules`,
        payload
    );
    return response.data;
};