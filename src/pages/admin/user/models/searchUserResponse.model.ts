import type { User } from "@/models/user.model";

export interface SearchUserResponse {
    success: boolean;
    data: User[];
    pageInfo: {
        pageNum: number;
        pageSize: number;
        totalItems: number;
    };
}
