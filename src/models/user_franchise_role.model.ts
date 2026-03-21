export interface UserFranchiseRole {
    id: string;
    franchiseId: string | null; // null nếu là GLOBAL (Admin)
    roleId: string;
    userId: string;
    isActive: boolean;
    isDeleted: boolean;
    is_deleted?: boolean;
    createdAt: string;
    updatedAt: string;
    roleCode?: string;
    roleName?: string;
    userName?: string;
    userEmail?: string;
    franchiseName?: string;
    note?: string;
}