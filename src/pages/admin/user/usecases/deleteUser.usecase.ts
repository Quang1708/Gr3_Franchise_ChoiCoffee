import { deleteUserService } from "../services/user06.service";

export const deleteUserUsecase = async (userId: string | number) => {
    return await deleteUserService(userId);
};
