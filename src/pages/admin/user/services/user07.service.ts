import { userApi } from "@/api";
import type { CreateUserResponse } from "../models/createUserResponse.model";
import type { RequestUser } from "../models/requestUser.model";

export const createUserService = async (payload: RequestUser) => {
    const res = await userApi.create(payload);
    return res as CreateUserResponse;
};
