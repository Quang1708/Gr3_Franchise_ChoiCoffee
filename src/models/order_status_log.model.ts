export interface OrderStatusLog {
    id: number;
    orderId: number;
    fromStatus: 'DRAFT' | 'CONFIRMED' | 'PREPARING' | 'COMPLETED' | 'CANCELLED';
    toStatus: 'DRAFT' | 'CONFIRMED' | 'PREPARING' | 'COMPLETED' | 'CANCELLED';
    changedBy: number; // ID nhân viên thực hiện đổi trạng thái
    note?: string;
    createdAt: string;
    updatedAt: string;
}