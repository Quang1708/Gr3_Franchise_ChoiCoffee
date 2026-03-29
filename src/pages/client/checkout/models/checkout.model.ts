export type CheckoutPaymentMethod = "CARD" | "COD" | "MOMO" | "VNPAY";

export interface CartCheckoutPayload {
  address: string;
  phone: string;
  message: string;
}

export interface PaymentConfirmPayload {
  method: CheckoutPaymentMethod;
  providerTxnId?: string;
}

export interface PaymentRefundPayload {
  refund_reason: string;
}

export interface SubmitCheckoutPayload {
  cartId: string;
  checkout: CartCheckoutPayload;
  payment: PaymentConfirmPayload;
}

export interface SubmitCheckoutResult {
  paymentId?: string;
  checkoutResponse: unknown;
  confirmResponse: unknown;
}
