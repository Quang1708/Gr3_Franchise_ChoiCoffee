export type ApiOrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELED";

export type LegacyOrderStatus =
  | "ACTIVE"
  | "ORDERED"
  | "CHECKED_OUT"
  | "CANCELLED";

export type RawOrderStatus =
  | ApiOrderStatus
  | LegacyOrderStatus
  | string;

export type ApiOrderItem = {
  id?: string | number;
  order_item_id?: string;
  quantity?: number;
  product_name?: string;
  productNameSnapshot?: string;
  product_image_url?: string;
  price_snapshot?: number;
  product_cart_price?: number;
  line_total?: number;
  final_line_total?: number;
};

export type ApiOrder = {
  _id?: string;              
  id?: string | number;      

  code?: string;
  order_code?: string;

  customer_id?: string;
  franchise_id?: string;

  franchise_name?: string;
  customer_name?: string;

  status?: RawOrderStatus;

  total_amount?: number;
  totalAmount?: number;

  subtotal_amount?: number;
  final_amount?: number;

  created_at?: string;
  createdAt?: string;

  updated_at?: string;
  updatedAt?: string;

  order_items?: ApiOrderItem[];
  cart_items?: ApiOrderItem[];
};

export type OrderTab =
  | "all"
  | "draft"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "completed"
  | "canceled";

export type ClientOrderStatus =
  | "draft"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "completed"
  | "canceled";

export type OrderListRow = {
  id: string;
  orderCode: string;
  orderDate: string;
  orderTime: string;
  createdAt: string;
  totalAmount: number;
  status: ClientOrderStatus;
  franchiseName: string;
  itemPreview: Array<{
    name: string;
    quantity: number;
    imageUrl: string;
  }>;
};

export type OrderStats = {
  processing: number;
  delivering: number;
  completed: number;
  monthlySpending: number;
};

export type OrderDetailView = {
  id: string;
  orderCode: string;
  status: ClientOrderStatus;
  createdAt: string;
  franchiseName: string;
  customerName: string;
  subtotal: number;
  total: number;
  items: Array<{
    id: string;
    name: string;
    imageUrl: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
};

export const getOrderId = (order: ApiOrder): string => {
  return String(order._id ?? order.id ?? "");
};

export const getOrderCode = (order: ApiOrder): string => {
  return order.code ?? order.order_code ?? "";
};

export const getCreatedAt = (order: ApiOrder): string => {
  return order.createdAt ?? order.created_at ?? "";
};

export const getTotalAmount = (order: ApiOrder): number => {
  return (
    order.final_amount ??
    order.total_amount ??
    order.totalAmount ??
    0
  );
};

export const toClientStatus = (
  apiStatus: RawOrderStatus | undefined,
): ClientOrderStatus => {
  const raw = String(apiStatus ?? "").toUpperCase();


  if (raw === "DRAFT") return "draft";

  if (raw === "CONFIRMED" || raw === "ACTIVE") return "confirmed";
  if (raw === "PREPARING") return "preparing";
  if (raw === "READY_FOR_PICKUP") return "ready_for_pickup";
  if (raw === "OUT_FOR_DELIVERY" || raw === "ORDERED") return "out_for_delivery";
  if (raw === "COMPLETED" || raw === "CHECKED_OUT") return "completed";
  if (raw === "CANCELED" || raw === "CANCELLED") return "canceled";

  return "confirmed";
};

export const mapOrderItem = (item: ApiOrderItem) => {
  return {
    id: String(item.order_item_id ?? item.id ?? ""),
    name: item.product_name ?? item.productNameSnapshot ?? "",
    imageUrl: item.product_image_url ?? "",
    quantity: item.quantity ?? 0,
    unitPrice: item.price_snapshot ?? item.product_cart_price ?? 0,
    lineTotal: item.final_line_total ?? item.line_total ?? 0,
  };
};

export const mapOrderToListRow = (order: ApiOrder): OrderListRow => {
  const createdAt = getCreatedAt(order);
  const date = new Date(createdAt);
  const items = order.order_items ?? order.cart_items ?? [];
  const itemPreview = items.slice(0, 2).map((item) => ({
    name: item.product_name ?? item.productNameSnapshot ?? "Sản phẩm",
    quantity: item.quantity ?? 0,
    imageUrl: item.product_image_url ?? "",
  }));

  return {
    id: getOrderId(order),
    orderCode: getOrderCode(order),
    createdAt,
    orderDate: isNaN(date.getTime())
      ? "--/--/----"
      : date.toLocaleDateString("vi-VN"),
    orderTime: isNaN(date.getTime())
      ? "--:--"
      : date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
    totalAmount: getTotalAmount(order),
    status: toClientStatus(order.status),
    franchiseName: order.franchise_name ?? "",
    itemPreview,
  };
};

export const mapOrderToDetail = (order: ApiOrder): OrderDetailView => {
  const items = order.order_items ?? order.cart_items ?? [];

  return {
    id: getOrderId(order),
    orderCode: getOrderCode(order),
    status: toClientStatus(order.status),
    createdAt: getCreatedAt(order),
    franchiseName: order.franchise_name ?? "",
    customerName: order.customer_name ?? "",
    subtotal: order.subtotal_amount ?? 0,
    total: getTotalAmount(order),
    items: items.map(mapOrderItem),
  };
};