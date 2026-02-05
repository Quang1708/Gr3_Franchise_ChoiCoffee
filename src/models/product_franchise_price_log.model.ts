export interface ProductFranchisePriceLog {
    id: number;
    productFranchiseId: number;
    oldPrice: number;
    newPrice: number;
    reason?: string;
    changedBy: number; // ID của Admin hoặc Manager
    createdAt: string;
    updatedAt: string;
}