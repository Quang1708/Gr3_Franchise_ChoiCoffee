import type { SearchUserRequest } from "@/pages/admin/user/models/searchUserRequest.model";
import { searchUsersApi } from "../services/user03.service";

export const searchUsersUsecase = async (payload: SearchUserRequest) => {
    return await searchUsersApi(payload);
};
