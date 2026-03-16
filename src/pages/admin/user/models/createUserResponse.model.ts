import type { User } from "@/models/user.model";

export interface CreateUserResponse {
    success: boolean;
    data: User;
}
