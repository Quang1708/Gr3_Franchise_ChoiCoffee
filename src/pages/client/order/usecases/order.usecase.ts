import { TAB_TO_API_STATUS, formatDateTime, toClientStatus } from "../constants/order.constants";
import type { ApiOrder, OrderDetailView, OrderListRow, OrderStats, OrderTab } from "../models/order.model";
import { getOrderByCode, getOrderById, getOrdersByCustomerId } from "../service/orderApi";

const mapOrderToOrderRow = (order: ApiOrder): OrderListRow => {
  const id = String(order.id ?? order._id ?? "");
  const createdAt =
    order.created_at ?? order.createdAt ?? order.updated_at ?? order.updatedAt ?? new Date().toISOString();
  const { orderDate, orderTime } = formatDateTime(createdAt);
  const itemSource = order.order_items ?? order.cart_items ?? [];
  const itemPreview = itemSource.slice(0, 2).map((item) => ({
    name: String(item.product_name ?? item.productNameSnapshot ?? "Sản phẩm"),
    quantity: Number(item.quantity ?? 0),
    imageUrl: String(item.product_image_url ?? ""),
  }));

  return {
    id,
    orderCode: String(order.code ?? order.order_code ?? (id.slice(-8).toUpperCase() || "N/A")),
    orderDate,
    orderTime,
    createdAt,
    totalAmount: Number(order.total_amount ?? order.totalAmount ?? order.final_amount ?? order.subtotal_amount ?? 0),
    status: toClientStatus(order.status),
    franchiseName: String(order.franchise_name ?? "N/A"),
    itemPreview,
  };
};

export const searchOrdersUsecase = async (
  customerId: string,
  activeTab: OrderTab,
): Promise<OrderListRow[]> => {
  const orders = await getOrdersByCustomerId(customerId, TAB_TO_API_STATUS[activeTab]);
  const mapped = orders.map(mapOrderToOrderRow);

  if (activeTab === "all") return mapped;
  return mapped.filter((item) => item.status === activeTab);
};

export const searchOrderByCodeUsecase = async (
  customerId: string,
  orderCode: string,
  activeTab: OrderTab,
): Promise<OrderListRow[]> => {
  const target = await getOrderByCode(orderCode);
  if (!target) return [];

  const targetCustomerId = String(target.customer_id ?? "");
  if (targetCustomerId && targetCustomerId !== customerId) {
    return [];
  }

  const mapped = mapOrderToOrderRow(target);
  if (activeTab !== "all" && mapped.status !== activeTab) {
    return [];
  }

  return [mapped];
};

export const buildOrderStatsUsecase = (orders: OrderListRow[]): OrderStats => {
  return {
    processing: orders.filter(
      (o) =>
        o.status === "confirmed" ||
        o.status === "preparing" ||
        o.status === "ready_for_pickup",
    ).length,
    delivering: orders.filter((o) => o.status === "out_for_delivery").length,
    completed: orders.filter((o) => o.status === "completed").length,
    monthlySpending: orders.reduce((sum, o) => sum + o.totalAmount, 0),
  };
};

export const filterOrdersByDateUsecase = (
  orders: OrderListRow[],
  fromDate: string,
  toDate: string,
): OrderListRow[] => {
  if (!fromDate && !toDate) return orders;

  const buildLocalDateKey = (value: string): string | null => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const startDate = fromDate && toDate && fromDate > toDate ? toDate : fromDate;
  const endDate = fromDate && toDate && fromDate > toDate ? fromDate : toDate;

  return orders.filter((order) => {
    const createdDateKey = buildLocalDateKey(order.createdAt);
    if (!createdDateKey) return false;

    if (startDate && createdDateKey < startDate) return false;
    if (endDate && createdDateKey > endDate) return false;

    return true;
  });
};

const mapOrderToOrderDetail = (order: ApiOrder): OrderDetailView => {
  const id = String(order.id ?? order._id ?? "");
  const createdAt =
    order.created_at ?? order.createdAt ?? order.updated_at ?? order.updatedAt ?? new Date().toISOString();
  const orderItems = order.order_items ?? order.cart_items ?? [];

  return {
    id,
    orderCode: String(order.code ?? order.order_code ?? (id.slice(-8).toUpperCase() || "N/A")),
    status: toClientStatus(order.status),
    createdAt,
    franchiseName: String(order.franchise_name ?? "N/A"),
    customerName: String(order.customer_name ?? "Khach hang"),
    subtotal: Number(order.subtotal_amount ?? order.total_amount ?? order.totalAmount ?? 0),
    total: Number(order.total_amount ?? order.totalAmount ?? order.final_amount ?? order.subtotal_amount ?? 0),
    items: orderItems.map((item) => ({
      id: String(item.id ?? item.order_item_id ?? ""),
      name: String(item.product_name ?? item.productNameSnapshot ?? "San pham"),
      imageUrl: String(item.product_image_url ?? ""),
      quantity: Number(item.quantity ?? 0),
      unitPrice: Number(item.price_snapshot ?? item.product_cart_price ?? 0),
      lineTotal: Number(item.line_total ?? item.final_line_total ?? 0),
    })),
  };
};

export const getOrderDetailUsecase = async (
  customerId: string,
  orderId: string,
): Promise<OrderDetailView | null> => {
  const target = await getOrderById(orderId);
  if (target) return mapOrderToOrderDetail(target);

  const fallbackOrders = await getOrdersByCustomerId(customerId, undefined);
  const fallbackTarget = fallbackOrders.find(
    (item) => String(item.id ?? item._id ?? "") === orderId,
  );
  if (!fallbackTarget) return null;

  return mapOrderToOrderDetail(fallbackTarget);
};
