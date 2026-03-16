import type { RequestUser } from "@/pages/admin/user/models/requestUser.model";
import { updateUserService } from "../services/user08.service";

export const updateUserUsecase = async (userId: string | number, payload: RequestUser) => {
    return await updateUserService(userId, payload);
};
