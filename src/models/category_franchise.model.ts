export interface CategoryFranchise {
    id: number;
    categoryId: number;
    franchiseId: number;
    displayOrder: number; // Thứ tự hiển thị trên App/POS
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}