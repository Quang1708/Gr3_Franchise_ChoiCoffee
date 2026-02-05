export interface Category {
    id: number;
    code: string;
    name: string;
    description?: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}