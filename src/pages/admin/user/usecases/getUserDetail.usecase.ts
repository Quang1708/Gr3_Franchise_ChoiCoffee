import { getUserDetailService } from "../services/user02.service";

export const getUserDetailUsecase = async (userId: string | number) => {
    return await getUserDetailService(userId);
};
