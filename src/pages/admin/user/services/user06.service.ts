import { userApi } from "@/api";

export const deleteUserService = async (userId: string | number) => {
    const res = await userApi.remove(userId);
    return res;
};
