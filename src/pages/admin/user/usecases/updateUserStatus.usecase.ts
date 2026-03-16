import { changeUserStatusService } from "../services/user08.service";

export const updateUserStatusUsecase = async (userId: string | number, is_active: boolean) => {
    return await changeUserStatusService(userId, { is_active });
};
