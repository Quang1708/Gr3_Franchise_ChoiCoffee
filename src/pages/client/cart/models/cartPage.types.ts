import type { OrderItem } from "@/models/order_item.model";
import type { Promotion } from "@/models/promotion.model";

export type CartSummary = {
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
};

export type DeleteModalState = {
  showDeleteModal: boolean;
  productToDelete: OrderItem | null;
};

export type VoucherState = {
  showVoucherModal: boolean;
  selectedPromotion: Promotion | null;
};
