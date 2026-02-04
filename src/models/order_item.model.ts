export interface OrderItem {
    id: number;
    orderId: number;
    productFranchiseId: number;
    productNameSnapshot: string; // Tên món tại thời điểm mua
    priceSnapshot: number; // Giá bán tại thời điểm mua (đã trừ KM nếu có)
    quantity: number;
    lineTotal: number; // priceSnapshot * quantity
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}