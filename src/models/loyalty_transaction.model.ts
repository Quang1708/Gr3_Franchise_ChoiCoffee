export interface LoyaltyTransaction {
    id: number;
    customerFranchiseId: number;
    orderId?: number; // Null nếu là giao dịch điều chỉnh (ADJUST) không qua đơn hàng
    type: 'EARN' | 'REDEEM' | 'ADJUST';
    pointChange: number; // Số dương nếu cộng, số âm nếu trừ
    reason?: string;
    createdBy: number; // ID nhân viên hoặc hệ thống thực hiện
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}