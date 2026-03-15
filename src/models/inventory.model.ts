export interface Inventory {
    id: string;
    productFranchiseId: string;
    quantity: number; 
    alertThreshold: number; 
    isActive: boolean; 
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}