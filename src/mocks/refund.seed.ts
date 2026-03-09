import type { Refund } from "@/models/refund.model";

export const REFUND_SEED_DATA: Refund[] = [
  {
    id: 1,
    paymentId: 3,
    amount: 45000,
    reason: "Khách yêu cầu hoàn tiền do hủy đơn",
    status: "COMPLETED",
    createdBy: 6,
    createdAt: "2024-06-01T11:25:00Z",
  },
  // more refunds could be added
];
