import { restoreUserService } from "../services/user08.service";

export const restoreUserUsecase = async (userId: string | number) => {
    return await restoreUserService(userId);
};
