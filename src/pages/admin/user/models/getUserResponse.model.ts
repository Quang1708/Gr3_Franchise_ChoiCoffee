import type { User } from "@/models/user.model";

export interface GetUserResponse {
    success: boolean;
    data: User;
}
