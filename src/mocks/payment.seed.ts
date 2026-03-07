import type { Payment } from "@/models/payment.model";

export const PAYMENT_SEED_DATA: Payment[] = [
  {
    id: 1,
    franchiseId: 1,
    orderId: 1,
    method: "CASH",
    amount: 85000,
    status: "SUCCESS",
    providerTxnId: undefined,
    paidAt: "2024-06-01T09:15:00Z",
    createdBy: 5,
    createdAt: "2024-06-01T09:15:00Z",
    updatedAt: "2024-06-01T09:15:00Z",
  },
  {
    id: 2,
    franchiseId: 1,
    orderId: 2,
    method: "VNPAY",
    amount: 120000,
    status: "PENDING",
    providerTxnId: "VNPAY123",
    // payment not yet completed
    paidAt: undefined,
    createdBy: undefined,
    createdAt: "2024-06-01T10:05:00Z",
    updatedAt: "2024-06-01T10:05:00Z",
  },
  {
    id: 3,
    franchiseId: 1,
    orderId: 3,
    method: "CARD",
    amount: 45000,
    status: "REFUNDED",
    providerTxnId: "CARD789",
    paidAt: "2024-06-01T11:05:00Z",
    createdBy: 6,
    createdAt: "2024-06-01T11:05:00Z",
    updatedAt: "2024-06-01T11:30:00Z",
  },
];
