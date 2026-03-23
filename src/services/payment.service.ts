import type { Payment } from "@/models/payment.model";
import type { Refund } from "@/models/refund.model";
import { axiosAdminClient } from "@/api/axios.config";

export type PaymentListItem = Payment;
export type RefundItem = Refund;

const PAYMENT_BASE = "/api/payments";

/** Chuẩn hóa item từ API (snake_case/camelCase) sang PaymentListItem */
function toPayment(raw: Record<string, unknown>): PaymentListItem {
  const id = Number(raw.id ?? 0);
  const franchiseId = Number(raw.franchiseId ?? raw.franchise_id ?? 0);
  const orderId = Number(raw.orderId ?? raw.order_id ?? 0);
  const method = String(raw.method ?? "CASH").toUpperCase() as Payment["method"];
  const amount = Number(raw.amount ?? 0);
  const status = String(raw.status ?? "PENDING").toUpperCase() as Payment["status"];
  const providerTxnId = raw.providerTxnId ?? raw.provider_txn_id;
  const paidAt = raw.paidAt ?? raw.paid_at;
  const createdByRaw = raw.createdBy ?? raw.created_by;
  const createdBy =
    createdByRaw != null && createdByRaw !== ""
      ? Number(createdByRaw)
      : undefined;
  const createdAt = String(
    raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
  );
  const updatedAt = String(
    raw.updatedAt ?? raw.updated_at ?? new Date().toISOString(),
  );

  return {
    id,
    franchiseId,
    orderId,
    method:
      method === "CARD" || method === "MOMO" || method === "VNPAY"
        ? method
        : "CASH",
    amount,
    status:
      status === "SUCCESS" || status === "FAILED" || status === "REFUNDED"
        ? status
        : "PENDING",
    providerTxnId:
      typeof providerTxnId === "string" ? providerTxnId : undefined,
    paidAt: typeof paidAt === "string" ? paidAt : undefined,
    createdBy,
    createdAt,
    updatedAt,
  };
}

/** Chuẩn hóa refund từ API sang RefundItem */
function toRefund(raw: Record<string, unknown>): RefundItem {
  const id = Number(raw.id ?? 0);
  const paymentId = Number(raw.paymentId ?? raw.payment_id ?? 0);
  const amount = Number(raw.amount ?? 0);
  const reason = raw.reason;
  const status = String(raw.status ?? "REQUESTED").toUpperCase() as Refund["status"];
  const createdByRaw = raw.createdBy ?? raw.created_by;
  const createdBy =
    createdByRaw != null && createdByRaw !== ""
      ? Number(createdByRaw)
      : undefined;
  const createdAt = String(
    raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
  );

  return {
    id,
    paymentId,
    amount,
    reason: typeof reason === "string" ? reason : undefined,
    status:
      status === "APPROVED" || status === "REJECTED" || status === "COMPLETED"
        ? status
        : "REQUESTED",
    createdBy,
    createdAt,
  };
}

/** Unwrap envelope { data } từ response */
function unwrapData(res: { data?: unknown }): unknown {
  const d = res?.data;
  if (d && typeof d === "object" && "data" in (d as object)) {
    return (d as { data: unknown }).data;
  }
  return d;
}

export async function getPayments(): Promise<PaymentListItem[]> {
  const { data } = await axiosAdminClient.get(PAYMENT_BASE);
  const raw = unwrapData({ data });
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((p: unknown) =>
    toPayment((p && typeof p === "object" ? p : {}) as Record<string, unknown>),
  );
}

export async function getRefundsByPayment(
  paymentId: number,
): Promise<RefundItem[]> {
  const { data } = await axiosAdminClient.get(
    `${PAYMENT_BASE}/${paymentId}/refunds`,
  );
  const raw = unwrapData({ data });
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((r: unknown) =>
    toRefund((r && typeof r === "object" ? r : {}) as Record<string, unknown>),
  );
}
