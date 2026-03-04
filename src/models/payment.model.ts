export interface Payment {
  id: number;
  franchiseId: number;
  orderId: number;
  method: "CASH" | "CARD" | "MOMO" | "VNPAY";
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  providerTxnId?: string;
  paidAt?: string;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}
