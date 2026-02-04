export interface Order {
  id: number;
  code: string; // Mã đơn hàng (VD: ORD001)
  franchiseId: number;
  customerId: number;
  type: 'POS' | 'ONLINE';
  status: 'DRAFT' | 'CONFIRMED' | 'PREPARING' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number; // Tổng tiền sau khi đã tính khuyến mãi
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdBy?: number; // ID nhân viên tạo đơn (thường là Staff)
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}