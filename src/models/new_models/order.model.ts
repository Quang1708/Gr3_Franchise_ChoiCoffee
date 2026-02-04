export type OrderType = "POS" | "ONLINE";
export type OrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "PREPARING"
  | "COMPLETED"
  | "CANCELLED";

export interface Order {
  id: number;
  code: string;
  franchiseId: number;
  customerId: number;
  type: OrderType;
  status: OrderStatus;
  totalAmount: number;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdBy?: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productFranchiseId: number;
  productNameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  lineTotal: number; // price * quantity
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusLog {
  id: number;
  orderId: number;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  changedBy: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
