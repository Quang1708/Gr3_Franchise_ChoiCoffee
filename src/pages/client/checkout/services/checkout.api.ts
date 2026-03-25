import { axiosClient } from "@/api/axios.config";
import type {
  CartCheckoutPayload,
  PaymentConfirmPayload,
  PaymentRefundPayload,
} from "../models/checkout.model";

export const checkoutCartApi = async (
  cartId: string,
  payload: CartCheckoutPayload,
) => {
  const response = await axiosClient.put(
    `/api/carts/${cartId}/checkout`,
    payload,
  );
  return response.data;
};

export const cancelCartCheckoutApi = async (cartId: string) => {
  const response = await axiosClient.put(`/api/carts/${cartId}/cancel`, {});
  return response.data;
};

export const getPaymentByOrderIdApi = async (orderId: string) => {
  const response = await axiosClient.get(`/api/payments/order/${orderId}`);
  return response.data;
};

export const confirmPaymentApi = async (
  paymentId: string,
  payload: PaymentConfirmPayload,
) => {
  const normalizedTxnId = payload.providerTxnId ?? "";

  const response = await axiosClient.put(`/api/payments/${paymentId}/confirm`, {
    method: payload.method,
    providerTxnId: normalizedTxnId,
    provider_txn_id: normalizedTxnId,
  });

  return response.data;
};

export const refundPaymentApi = async (
  paymentId: string,
  payload: PaymentRefundPayload,
) => {
  const response = await axiosClient.put(
    `/api/payments/${paymentId}/refund`,
    payload,
  );
  return response.data;
};
