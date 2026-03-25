import { userApi } from "@/api";
import type { CreateUserResponse } from "../models/createUserResponse.model";
import type { RequestUser } from "../models/requestUser.model";

export const createUserService = async (payload: RequestUser) => {
    const res = await userApi.create({
        email: payload.email,
        password: payload.password,
        name: payload.name,
        phone: payload.phone,
        role_code: payload.roleCode,
        avatar_url: payload.avatar_url,
    });
    return res as CreateUserResponse;
};
