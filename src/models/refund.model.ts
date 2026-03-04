export interface Refund {
  id: number;
  paymentId: number;
  amount: number;
  reason?: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED";
  createdBy?: number;
  createdAt: string;
}
