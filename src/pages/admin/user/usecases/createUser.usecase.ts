import type { RequestUser } from "@/pages/admin/user/models/requestUser.model";
import { createUserService } from "../services/user07.service";

export const createUserUsecase = async (payload: RequestUser) => {
    return await createUserService(payload);
};
