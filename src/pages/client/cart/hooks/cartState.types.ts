import type { Dispatch, SetStateAction } from "react";
import type { OrderItem } from "@/models/order_item.model";
import type { CartVoucher } from "../models/cartVoucher.model";

export type CartPricingState = {
  cartId: string;
  franchiseId: string;
  subtotalAmount: number;
  promotionDiscount: number;
  voucherDiscount: number;
  finalAmount: number;
  voucherCode: string;
};

export type CartPricingMap = Record<string, CartPricingState>;

export type VoucherContext = {
  cartId: string;
  franchiseId: string;
  franchiseName: string;
  voucherCode: string;
};

export type FranchiseToDelete = {
  cartItemIds: string[];
  franchiseName: string;
};

export type CartError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export type UpdatePricingMapAndTotals = (
  targetCartId: string,
  updater: (current: CartPricingState) => CartPricingState,
) => void;

export type SetOrderItems = Dispatch<SetStateAction<OrderItem[]>>;
export type SetSelectedIds = Dispatch<SetStateAction<number[]>>;
export type SetSelectedVoucher = Dispatch<SetStateAction<CartVoucher | null>>;
