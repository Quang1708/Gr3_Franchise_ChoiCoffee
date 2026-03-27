import type { Payment } from "@/models/payment.model";
import type { Refund } from "@/models/refund.model";
import { axiosAdminClient } from "@/api/axios.config";

export type PaymentListItem = Omit<
  Payment,
  "id" | "franchiseId" | "orderId" | "createdBy"
> & {
  id: string;
  franchiseId: string;
  orderId: string;
  createdBy?: string;
  paymentCode?: string;
  franchiseName?: string;
  customerName?: string;
  customerId?: string;
};
export type RefundItem = Refund;

const PAYMENT_BASE = "/api/payments";

function nestedEntityName(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const o = value as Record<string, unknown>;
  const name = o.name;
  if (typeof name === "string" && name.trim() !== "") return name.trim();
  return undefined;
}

function toPayment(raw: Record<string, unknown>): PaymentListItem {
  const toTextId = (value: unknown, fallback = "0") => {
    if (value == null) return fallback;
    if (typeof value === "object") {
      const obj = value as Record<string, unknown>;
      const nested =
        obj._id ?? obj.id ?? obj.value ?? obj.code ?? obj.order_id ?? null;
      if (nested != null) return toTextId(nested, fallback);
    }
    const text = String(value).trim();
    return text === "" ? fallback : text;
  };

  const id = toTextId(raw.id ?? raw._id, "0");
  const franchiseId = toTextId(raw.franchiseId ?? raw.franchise_id, "0");
  const orderId = toTextId(raw.orderId ?? raw.order_id, "0");
  const franchiseRaw = raw.franchiseId ?? raw.franchise_id;
  const customerRaw = raw.customerId ?? raw.customer_id;
  const franchiseDisplayName = nestedEntityName(franchiseRaw);
  const customerDisplayName = nestedEntityName(customerRaw);
  const customerIdResolved = toTextId(customerRaw, "0");
  const method = String(raw.method ?? "CASH").toUpperCase() as Payment["method"];
  const amount = Number(raw.amount ?? 0);
  const rawStatus = String(raw.status ?? "PENDING").toUpperCase();
  const status = (rawStatus === "PAID" ? "SUCCESS" : rawStatus) as Payment["status"];
  const providerTxnId = raw.providerTxnId ?? raw.provider_txn_id;
  const businessCode =
    typeof raw.code === "string" && raw.code.trim() !== ""
      ? raw.code.trim()
      : undefined;
  const paidAt = raw.paidAt ?? raw.paid_at;
  const createdByRaw = raw.createdBy ?? raw.created_by;
  const createdBy =
    createdByRaw != null && createdByRaw !== ""
      ? String(createdByRaw)
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
    paymentCode: businessCode,
    franchiseName: franchiseDisplayName,
    customerName: customerDisplayName,
    customerId: customerIdResolved !== "0" ? customerIdResolved : undefined,
    providerTxnId:
      typeof providerTxnId === "string" ? providerTxnId : undefined,
    paidAt: typeof paidAt === "string" ? paidAt : undefined,
    createdBy,
    createdAt,
    updatedAt,
  };
}

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

function unwrapData(res: { data?: unknown }): unknown {
  let d = res?.data;
  while (
    d &&
    typeof d === "object" &&
    !Array.isArray(d) &&
    "data" in (d as object)
  ) {
    const inner = (d as { data: unknown }).data;
    if (inner === d) break;
    d = inner;
  }
  return d;
}

export async function getPayments(): Promise<PaymentListItem[]> {
  const { data } = await axiosAdminClient.get(PAYMENT_BASE);
  const raw = unwrapData({ data });
  return toPaymentArray(raw);
}

function toPaymentArray(raw: unknown): PaymentListItem[] {
  const pickArray = (value: unknown): unknown[] => {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== "object") return [];
    const obj = value as Record<string, unknown>;
    const candidates = [
      obj.items,
      obj.results,
      obj.rows,
      obj.list,
      obj.payments,
      obj.payment,
      obj.data,
    ];
    for (const c of candidates) {
      if (Array.isArray(c)) return c;
      if (c && typeof c === "object") return [c];
    }
    return [obj];
  };

  const arr = pickArray(raw);
  return arr.map((p: unknown) =>
    toPayment((p && typeof p === "object" ? p : {}) as Record<string, unknown>),
  );
}

export async function getPaymentById(id: string | number): Promise<PaymentListItem> {
  const { data } = await axiosAdminClient.get(`${PAYMENT_BASE}/${id}`);
  const raw = unwrapData({ data });
  return toPayment((raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>);
}

export async function getPaymentByCode(
  code: string,
): Promise<PaymentListItem | null> {
  try {
    const { data } = await axiosAdminClient.get(`${PAYMENT_BASE}/code`, {
      params: { code },
    });
    const raw = unwrapData({ data });
    if (!raw) return null;
    return toPayment(
      (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>,
    );
  } catch {
    const { data } = await axiosAdminClient.get(
      `${PAYMENT_BASE}/code/${encodeURIComponent(code)}`,
    );
    const raw = unwrapData({ data });
    if (!raw) return null;
    return toPayment(
      (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>,
    );
  }
}

export async function getPaymentByOrderId(
  orderId: string | number,
): Promise<PaymentListItem[]> {
  const { data } = await axiosAdminClient.get(`${PAYMENT_BASE}/order/${orderId}`);
  const raw = unwrapData({ data });
  return toPaymentArray(raw);
}

export async function getPaymentsByCustomerId(
  customerId: string | number,
): Promise<PaymentListItem[]> {
  const { data } = await axiosAdminClient.get(
    `${PAYMENT_BASE}/customer/${customerId}`,
  );
  const raw = unwrapData({ data });
  return toPaymentArray(raw);
}

export async function confirmPaymentById(
  id: string | number,
  payload?: { method?: Payment["method"]; providerTxnId?: string },
): Promise<PaymentListItem> {
  const body = payload
    ? {
        method: payload.method,
        provider_txn_id: payload.providerTxnId,
      }
    : undefined;
  const { data } = await axiosAdminClient.put(`${PAYMENT_BASE}/${id}/confirm`, body);
  const raw = unwrapData({ data });
  return toPayment((raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>);
}

export async function refundPaymentById(
  id: string | number,
): Promise<PaymentListItem> {
  const { data } = await axiosAdminClient.put(`${PAYMENT_BASE}/${id}/refund`);
  const raw = unwrapData({ data });
  return toPayment((raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>);
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
