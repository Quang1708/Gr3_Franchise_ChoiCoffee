import { userApi } from "@/api";
import type { SearchUserResponse } from "../models/searchUserResponse.model";
import type { SearchUserRequest } from "../models/searchUserRequest.model";

export const searchUsersApi = async (payload: SearchUserRequest) => {
    let isActive: boolean | "" = "";
    if (typeof payload.searchCondition.is_active === "string") {
        isActive = payload.searchCondition.is_active === "" ? "" : (eval(payload.searchCondition.is_active) as boolean);
    } else if (typeof payload.searchCondition.is_active === "boolean") {
        isActive = payload.searchCondition.is_active;
    }
    
    let isDeleted: boolean | "" = "";
    if (typeof payload.searchCondition.is_deleted === "string") {
        isDeleted = payload.searchCondition.is_deleted === "" ? "" : (eval(payload.searchCondition.is_deleted) as boolean);
    } else if (typeof payload.searchCondition.is_deleted === "boolean") {
        isDeleted = payload.searchCondition.is_deleted;
    }
    
    const res = await userApi.search({
        keyword: payload.searchCondition.keyword || "",
        is_active: isActive,
        is_deleted: isDeleted,
        pageNum: payload.pageInfo.pageNum,
        pageSize: payload.pageInfo.pageSize,
    });
    
    return res as SearchUserResponse;
};
