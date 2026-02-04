export interface UserFranchiseRole {
    id: number;
    franchiseId: number | null; // null nếu là GLOBAL (Admin)
    roleId: number;
    userId: number;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}