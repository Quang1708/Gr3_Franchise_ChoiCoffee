import type {
  SubmitCheckoutPayload,
  SubmitCheckoutResult,
} from "../models/checkout.model";
import {
  cancelCartCheckoutApi,
  checkoutCartApi,
  confirmPaymentApi,
  getPaymentByOrderIdApi,
  refundPaymentApi,
} from "../services/checkout.api";

const asObject = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
};

const toStringOrUndefined = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
};

const pickPaymentId = (value: unknown): string | undefined => {
  const root = asObject(value);
  if (!root) return undefined;

  const directKeys = ["paymentId", "payment_id"] as const;
  const nestedIdKeys = ["id", "_id", "paymentId", "payment_id"] as const;

  for (const key of directKeys) {
    const maybeId = toStringOrUndefined(root[key]);
    if (maybeId) return maybeId;
  }

  const nestedCandidates = [
    root.payment,
    root.data,
    root.result,
    root.checkout,
    root.order,
  ];

  for (const candidate of nestedCandidates) {
    const candidateObj = asObject(candidate);
    if (!candidateObj) continue;

    for (const key of nestedIdKeys) {
      const maybeId = toStringOrUndefined(candidateObj[key]);
      if (maybeId) return maybeId;
    }
  }

  return undefined;
};

const pickPaymentData = (value: unknown): Record<string, unknown> | null => {
  const root = asObject(value);
  if (!root) return null;

  const candidates = [root.data, root.payment, root.result, root];
  for (const candidate of candidates) {
    const candidateObj = asObject(candidate);
    if (candidateObj) return candidateObj;
  }

  return null;
};

export const getPaymentByOrderId = async (orderId: string) => {
  const response = await getPaymentByOrderIdApi(orderId);
  const paymentData = pickPaymentData(response);
  const paymentId = pickPaymentId(response);

  return {
    paymentId,
    paymentData,
    response,
  };
};

export const confirmPaymentByPaymentId = async (
  paymentId: string,
  method: "CARD" | "CASH" | "MOMO" | "VNPAY",
  providerTxnId = "",
) => {
  return confirmPaymentApi(paymentId, {
    method,
    providerTxnId,
  });
};

export const submitCheckout = async (
  payload: SubmitCheckoutPayload,
): Promise<SubmitCheckoutResult> => {
  const checkoutResponse = await checkoutCartApi(
    payload.cartId,
    payload.checkout,
  );
  const paymentId = pickPaymentId(checkoutResponse);

  const confirmResponse = paymentId
    ? await confirmPaymentApi(paymentId, payload.payment)
    : null;

  return {
    paymentId,
    checkoutResponse,
    confirmResponse,
  };
};

export const cancelCheckout = async (cartId: string) => {
  return cancelCartCheckoutApi(cartId);
};

export const refundPayment = async (paymentId: string, reason: string) => {
  return refundPaymentApi(paymentId, { refund_reason: reason });
};
