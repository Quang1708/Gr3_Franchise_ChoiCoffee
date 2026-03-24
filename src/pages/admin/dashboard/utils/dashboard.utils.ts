import type { PaymentListItem } from "@/services/payment.service";
import type { TrendDirection } from "../models/dashboard.model";

export const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export const formatShortDate = (value: Date) =>
  value.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export const getPaymentDate = (payment: PaymentListItem) => {
  const value = payment.paidAt ?? payment.createdAt;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export const buildTrendStats = (current: number, previous: number) => {
  if (!previous) {
    return { pct: current ? null : 0, direction: current ? "up" : "flat" } as const;
  }
  const diff = current - previous;
  const pct = Math.round((diff / previous) * 100);
  return {
    pct,
    direction: diff > 0 ? "up" : diff < 0 ? "down" : "flat",
  } as const;
};

export const getOrderStatusLabel = (status: string) => {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "CONFIRMED":
      return "Confirmed";
    case "PREPARING":
      return "Preparing";
    case "READY_FOR_PICKUP":
      return "Ready";
    case "OUT_FOR_DELIVERY":
      return "Out for Delivery";
    case "COMPLETED":
      return "Completed";
    case "CANCELED":
      return "Canceled";
    default:
      return status;
  }
};

export const getOrderStatusBadge = (status: string) => {
  switch (status) {
    case "DRAFT":
      return "bg-gray-100 text-gray-600";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-600";
    case "PREPARING":
      return "bg-orange-100 text-orange-600";
    case "READY_FOR_PICKUP":
      return "bg-teal-100 text-teal-600";
    case "OUT_FOR_DELIVERY":
      return "bg-purple-100 text-purple-600";
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-600";
    case "CANCELED":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export const formatTrendLabel = (trend: {
  pct: number | null;
  direction: TrendDirection;
}) => {
  if (trend.pct === null) return "New";
  return `${trend.pct > 0 ? "+" : ""}${trend.pct}%`;
};
