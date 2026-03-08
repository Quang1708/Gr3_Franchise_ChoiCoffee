import { PAYMENT_SEED_DATA } from "@/mocks/payment.seed";
import { REFUND_SEED_DATA } from "@/mocks/refund.seed";

export type PaymentListItem = typeof PAYMENT_SEED_DATA[number];
export type RefundItem = typeof REFUND_SEED_DATA[number];

const USE_MOCK_API =
  !import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_MOCK_USER_API === "true";

export async function getPayments(): Promise<PaymentListItem[]> {
  if (USE_MOCK_API) {
    await new Promise((r) => setTimeout(r, 300));
    return PAYMENT_SEED_DATA;
  }

  try {
    const { data } = await import("@/api/axios.config").then((m) =>
      m.axiosClient.get("/payments"),
    );
    if (!Array.isArray(data)) return [];
    return data.map((p: any) => ({
      id: Number(p.id),
      franchiseId: Number(p.franchiseId ?? p.franchise_id),
      orderId: Number(p.orderId ?? p.order_id),
      method: String(p.method) as PaymentListItem["method"],
      amount: Number(p.amount),
      status: String(p.status) as PaymentListItem["status"],
      providerTxnId: p.providerTxnId ?? p.provider_txn_id ?? undefined,
      paidAt: p.paidAt ?? p.paid_at ?? undefined,
      createdBy: p.createdBy ?? p.created_by,
      createdAt: String(p.createdAt ?? p.created_at ?? new Date().toISOString()),
      updatedAt: String(p.updatedAt ?? p.updated_at ?? new Date().toISOString()),
      // backend already handles deletion; no local flag
    } as PaymentListItem));
  } catch (err) {
    console.error("getPayments failed, falling back to mock", err);
    // if backend is unavailable or endpoint missing during development, return mock data
    return PAYMENT_SEED_DATA;
  }
}

export async function getRefundsByPayment(
  paymentId: number,
): Promise<RefundItem[]> {
  if (USE_MOCK_API) {
    await new Promise((r) => setTimeout(r, 200));
    return REFUND_SEED_DATA.filter((r) => r.paymentId === paymentId);
  }
  const { data } = await import("@/api/axios.config").then((m) =>
    m.axiosClient.get(`/payments/${paymentId}/refunds`),
  );
  if (!Array.isArray(data)) return [];
  return data.map((r: any) => ({
    id: Number(r.id),
    paymentId: Number(r.paymentId ?? r.payment_id),
    amount: Number(r.amount),
    reason: r.reason,
    status: String(r.status) as RefundItem["status"],
    createdBy: r.createdBy ?? r.created_by,
    createdAt: String(r.createdAt ?? r.created_at ?? new Date().toISOString()),
  } as RefundItem));
}
