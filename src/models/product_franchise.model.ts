export interface ProductFranchise {
    id: number;
    franchiseId: number;
    productId: number;
    priceBase: number; // Phải nằm trong khoảng [minPrice, maxPrice] của bảng Product
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}