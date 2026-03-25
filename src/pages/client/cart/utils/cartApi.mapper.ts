import type { OrderItem } from "@/models/order_item.model";

type RawCartItem = {
  cart_item_id?: string;
  product_franchise_id?: string;
  quantity?: number;
  product_cart_price?: number;
  line_total?: number;
  final_line_total?: number;
  product_name?: string;
  product_image_url?: string;
  product?: {
    name?: string;
    image_url?: string;
  };
  options?: RawCartItemOption[];
};

type RawCartItemOption = {
  quantity?: number;
  product_franchise_id?: string;
  price_snapshot?: number;
  final_price?: number;
  product_name?: string;
  product_image_url?: string;
};

type RawCartData = {
  _id?: string;
  franchise_id?: string;
  franchise_name?: string;
  franchise_image_url?: string;
  cart_items?: RawCartItem[];
};

export type RawCart = RawCartData;

export type CartDisplayMeta = {
  franchiseName: string;
  franchiseImageUrl: string;
};

export type CartPricing = {
  cartId: string;
  franchiseId: string;
  subtotalAmount: number;
  promotionDiscount: number;
  voucherDiscount: number;
  finalAmount: number;
  voucherCode: string;
};

const toNumber = (value: unknown, fallback = 0): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const toStableNumber = (value: string, fallback: number): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }

  const normalized = Math.abs(hash);
  return normalized > 0 ? normalized : fallback;
};

export const mapCartDataToOrderItems = (cartData: RawCartData): OrderItem[] => {
  const now = new Date().toISOString();
  const cartId = String(cartData._id ?? "");
  const franchiseId = String(cartData.franchise_id ?? "");
  const franchiseName = cartData.franchise_name || "Chi nhánh ChoiCoffee";
  const franchiseImageUrl =
    cartData.franchise_image_url ||
    "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=500&q=80";

  return (cartData.cart_items ?? []).map((item, index) => ({
    options: (item.options ?? []).map((option, optionIndex) => ({
      productFranchiseRawId: String(option.product_franchise_id ?? ""),
      productNameSnapshot: option.product_name || `Option ${optionIndex + 1}`,
      productImageUrl: option.product_image_url,
      quantity: toNumber(option.quantity, 1),
      priceSnapshot: toNumber(option.price_snapshot),
      finalPrice: toNumber(option.final_price ?? option.price_snapshot),
    })),
    id: index + 1,
    orderId: 0,
    productFranchiseId: toStableNumber(
      `${cartId}-${item.cart_item_id ?? item.product_franchise_id ?? index}`,
      index + 1,
    ),
    cartId,
    cartItemId: String(item.cart_item_id ?? ""),
    productFranchiseRawId: String(item.product_franchise_id ?? ""),
    franchiseId,
    franchiseName,
    franchiseImageUrl,
    productNameSnapshot:
      item.product_name || item.product?.name || `Sản phẩm ${index + 1}`,
    productImageUrl:
      item.product_image_url ||
      item.product?.image_url ||
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=300&q=80",
    priceSnapshot: toNumber(item.product_cart_price),
    quantity: toNumber(item.quantity, 1),
    lineTotal: toNumber(item.final_line_total ?? item.line_total),
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  }));
};

export const extractCartDisplayMeta = (
  cartData: RawCartData,
): CartDisplayMeta => {
  return {
    franchiseName: cartData.franchise_name || "Chi nhánh ChoiCoffee",
    franchiseImageUrl:
      cartData.franchise_image_url ||
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=500&q=80",
  };
};

export const extractCartPricing = (cartData: RawCartData): CartPricing => {
  const raw = cartData as RawCartData & {
    franchise_id?: string;
    subtotal_amount?: number;
    promotion_discount?: number;
    voucher_discount?: number;
    final_amount?: number;
    voucher_code?: string;
  };

  const fallbackSubtotal = (cartData.cart_items ?? []).reduce(
    (sum, item) => sum + toNumber(item.final_line_total ?? item.line_total),
    0,
  );

  const subtotalAmount = toNumber(raw.subtotal_amount, fallbackSubtotal);
  const promotionDiscount = toNumber(raw.promotion_discount, 0);
  const voucherDiscount = toNumber(raw.voucher_discount, 0);
  const finalAmount = toNumber(
    raw.final_amount,
    subtotalAmount - promotionDiscount - voucherDiscount,
  );

  return {
    cartId: String(cartData._id ?? ""),
    franchiseId: String(raw.franchise_id ?? ""),
    subtotalAmount,
    promotionDiscount,
    voucherDiscount,
    finalAmount,
    voucherCode: String(raw.voucher_code ?? ""),
  };
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === "object";
};

const pickCartListFromUnknown = (value: unknown): RawCartData[] => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(
      (item): item is RawCartData =>
        isObject(item) && Array.isArray((item as RawCartData).cart_items),
    );
  }

  if (isObject(value) && Array.isArray(value.cart_items)) {
    return [value as unknown as RawCartData];
  }

  return [];
};

const pickCartFromUnknown = (value: unknown): RawCartData | null => {
  return pickCartListFromUnknown(value)[0] ?? null;
};

export const extractCartDataList = (response: unknown): RawCartData[] => {
  if (!response || typeof response !== "object") {
    return [];
  }

  const payload = response as {
    data?: unknown;
    result?: unknown;
    cart?: unknown;
  };

  const fromData = pickCartListFromUnknown(payload.data);
  if (fromData.length > 0) return fromData;

  const fromResult = pickCartListFromUnknown(payload.result);
  if (fromResult.length > 0) return fromResult;

  const fromCart = pickCartListFromUnknown(payload.cart);
  if (fromCart.length > 0) return fromCart;

  return pickCartListFromUnknown(response);
};

export const extractCartData = (response: unknown): RawCartData | null => {
  if (!response || typeof response !== "object") {
    return null;
  }

  const payload = response as {
    data?: unknown;
    result?: unknown;
    cart?: unknown;
  };

  return (
    pickCartFromUnknown(payload.data) ||
    pickCartFromUnknown(payload.result) ||
    pickCartFromUnknown(payload.cart) ||
    pickCartFromUnknown(response)
  );
};
