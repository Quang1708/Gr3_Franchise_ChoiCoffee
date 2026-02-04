export interface Role {
    id: number;
    code: string;
    name: string;
    description?: string;
    scope: "GLOBAL" | "FRANCHISE";
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}