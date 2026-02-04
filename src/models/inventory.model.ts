export interface Inventory {
    id: number;
    productFranchiseId: number;
    quantity: number; // decimal trong DB, dùng number trong TS
    alertThreshold: number; // Ngưỡng cảnh báo sắp hết hàng
    isActive: boolean; // true -> AVAILABLE / false -> OUT_OF_STOCK
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}