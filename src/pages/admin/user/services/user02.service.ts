import { userApi } from "@/api";
import type { GetUserResponse } from "../models/getUserResponse.model";

export const getUserDetailService = async (userId: string | number) => {
    const res = await userApi.getById(userId);
    return res as GetUserResponse;
};
