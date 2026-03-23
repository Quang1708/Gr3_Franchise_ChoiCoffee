import type { ApiOrderStatus, ClientOrderStatus, OrderTab } from "../models/order.model";

/**
 * Tabs hiển thị trên UI
 */
export const ORDER_TABS: Array<{ key: OrderTab; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "draft", label: "Chưa hoàn tất" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "preparing", label: "Đang chuẩn bị" },
  { key: "ready_for_pickup", label: "Sẵn sàng lấy hàng" },
  { key: "out_for_delivery", label: "Đang giao hàng" },
  { key: "completed", label: "Hoàn thành" },
  { key: "canceled", label: "Đã huỷ" },
];

/**
 * Map tab → API status
 */
export const TAB_TO_API_STATUS: Record<OrderTab, ApiOrderStatus | undefined> = {
  all: undefined,
  draft: "DRAFT",
  confirmed: "CONFIRMED",
  preparing: "PREPARING",
  ready_for_pickup: "READY_FOR_PICKUP",
  out_for_delivery: "OUT_FOR_DELIVERY",
  completed: "COMPLETED",
  canceled: "CANCELED",
};

/**
 * Badge hiển thị status
 */
export const ORDER_STATUS_BADGE: Record<
  ClientOrderStatus,
  {
    label: string;
    className: string;
    dot: string;
  }
> = {
  draft: {
    label: "Chưa hoàn tất",
    className: "bg-slate-500/15 text-slate-600 border-slate-400/30",
    dot: "bg-slate-500",
  },
  confirmed: {
    label: "Đã xác nhận",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    dot: "bg-blue-500",
  },
  preparing: {
    label: "Đang chuẩn bị",
    className: "bg-cyan-500/20 text-cyan-500 border-cyan-500/30",
    dot: "bg-cyan-500",
  },
  ready_for_pickup: {
    label: "Sẵn sàng lấy hàng",
    className: "bg-amber-500/20 text-amber-500 border-amber-500/30",
    dot: "bg-amber-500",
  },
  out_for_delivery: {
    label: "Đang giao hàng",
    className: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    dot: "bg-orange-500",
  },
  completed: {
    label: "Hoàn thành",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
    dot: "bg-green-500",
  },
  canceled: {
    label: "Đã huỷ",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
    dot: "bg-red-500",
  },
};

/**
 * Convert API status → Client status (QUAN TRỌNG)
 */
export const toClientStatus = (
  apiStatus: ApiOrderStatus | string | undefined,
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

/**
 * Format tiền VNĐ
 */
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Format ngày giờ
 */
export const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      orderDate: "--/--/----",
      orderTime: "--:--",
    };
  }

  return {
    orderDate: date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    orderTime: date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};