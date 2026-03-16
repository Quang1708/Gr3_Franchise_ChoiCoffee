import { userApi } from "@/api";
import type { RequestUser } from "../models/requestUser.model";

export const updateUserService = async (userId: string | number, payload: RequestUser) => {
    const res = await userApi.update(userId, payload as unknown as Record<string, unknown>);
    return res;
};

export const changeUserStatusService = async (userId: string | number, payload: { is_active: boolean }) => {
    const res = await userApi.changeStatus(userId, payload);
    return res;
};

export const restoreUserService = async (userId: string | number) => {
    const res = await userApi.restore(userId);
    return res;
};
