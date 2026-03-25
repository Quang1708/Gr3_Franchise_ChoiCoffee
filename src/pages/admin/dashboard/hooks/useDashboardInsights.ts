import { useEffect, useMemo, useState } from "react";
import { getPayments, type PaymentListItem } from "@/services/payment.service";
import { getOrderDetail } from "@/components/order/services/getOrder.service";
import type {
  RecentOrderItem,
  TopProductItem,
  TrendMeta,
  TrendRange,
} from "../models/dashboard.model";
// import { toastError } from "@/utils/toast.util";
import {
  buildTrendStats,
  formatShortDate,
  getPaymentDate,
} from "../utils/dashboard.utils";

const buildTrendMeta = (
  payments: PaymentListItem[],
  trendRange: TrendRange,
): TrendMeta => {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d: Date, days: number) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

  let start = startOfDay(now);
  const end = now;
  let prevStart = startOfDay(addDays(now, -1));
  let prevEnd = new Date(start.getTime() - 1);
  let label = "Today";
  let compareLabel = "vs yesterday";

  if (trendRange === "7d") {
    start = startOfDay(addDays(now, -6));
    prevStart = startOfDay(addDays(now, -13));
    prevEnd = new Date(start.getTime() - 1);
    label = "Last 7 days";
    compareLabel = "vs previous 7 days";
  }

  if (trendRange === "30d") {
    start = startOfDay(addDays(now, -29));
    prevStart = startOfDay(addDays(now, -59));
    prevEnd = new Date(start.getTime() - 1);
    label = "Last 30 days";
    compareLabel = "vs previous 30 days";
  }

  const successPayments = payments.filter((p) => p.status === "SUCCESS");
  const currentPayments = successPayments.filter((p) => {
    const dt = getPaymentDate(p);
    return dt >= start && dt <= end;
  });
  const prevPayments = successPayments.filter((p) => {
    const dt = getPaymentDate(p);
    return dt >= prevStart && dt <= prevEnd;
  });

  const currentRevenue = currentPayments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0,
  );
  const prevRevenue = prevPayments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0,
  );

  const currentOrders = currentPayments.length;
  const prevOrders = prevPayments.length;
  const avgOrderValue = currentOrders
    ? Math.round(currentRevenue / currentOrders)
    : 0;

  return {
    label,
    compareLabel,
    currentRevenue,
    prevRevenue,
    currentOrders,
    prevOrders,
    avgOrderValue,
    revenueChange: buildTrendStats(currentRevenue, prevRevenue),
    ordersChange: buildTrendStats(currentOrders, prevOrders),
  };
};

export const useDashboardInsights = (
  normalizedFranchiseId: string | null,
  isGlobalContext: boolean,
  scopeLabel: string,
  trendRange: TrendRange,
) => {
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState<RecentOrderItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadPayments = async () => {
      try {
        setIsPaymentsLoading(true);
        const data = await getPayments();
        if (!isActive) return;
        let list = Array.isArray(data) ? data : [];
        if (!isGlobalContext && normalizedFranchiseId) {
          const fid = String(normalizedFranchiseId);
          list = list.filter((p) => String(p.franchiseId) === fid);
        }
        setPayments(list);
      } catch {
        if (!isActive) return;
        setPayments([]);
        // toastError("Cannot load payment data");
      } finally {
        if (isActive) setIsPaymentsLoading(false);
      }
    };

    void loadPayments();

    return () => {
      isActive = false;
    };
  }, [isGlobalContext, normalizedFranchiseId]);

  useEffect(() => {
    let isActive = true;

    const loadInsights = async () => {
      if (!payments.length) {
        setRecentOrders([]);
        setTopProducts([]);
        setIsInsightsLoading(false);
        return;
      }

      setIsInsightsLoading(true);

      const sorted = [...payments].sort(
        (a, b) => getPaymentDate(b).getTime() - getPaymentDate(a).getTime(),
      );
      const sample = sorted.filter((p) => p.orderId).slice(0, 15);

      if (!sample.length) {
        setRecentOrders([]);
        setTopProducts([]);
        setIsInsightsLoading(false);
        return;
      }

      const results = await Promise.allSettled(
        sample.map((payment) => getOrderDetail(String(payment.orderId))),
      );

      if (!isActive) return;

      const orders = results
        .map((res, index) => {
          if (res.status !== "fulfilled") return null;
          const payment = sample[index];
          const raw = res.value as Record<string, unknown> | null;
          const orderData =
            (raw as { data?: Record<string, unknown> } | null)?.data ?? raw;
          if (!orderData) return null;
          return { order: orderData, payment };
        })
        .filter(Boolean) as Array<{
        order: Record<string, unknown>;
        payment: PaymentListItem;
      }>;

      const recent = orders.slice(0, 5).map(({ order, payment }) => {
        const amount = Number(order.final_amount ?? payment.amount ?? 0);
        const status = String(order.status ?? "PAID");
        return {
          id: String(order._id ?? payment.orderId ?? payment.id ?? ""),
          code: String(order.code ?? `#${payment.orderId}`),
          customerName: String(order.customer_name ?? "Unknown"),
          franchiseName: String(order.franchise_name ?? scopeLabel),
          status,
          amount,
          dateLabel: formatShortDate(getPaymentDate(payment)),
        } as RecentOrderItem;
      });

      const productMap = new Map<string, TopProductItem>();
      orders.forEach(({ order }) => {
        const items = Array.isArray(order.order_items) ? order.order_items : [];
        items.forEach((item) => {
          const name = String(item.product_name ?? "Unknown");
          const quantity = Number(item.quantity ?? 0);
          const revenue = Number(item.final_line_total ?? item.line_total ?? 0);
          if (!name || quantity <= 0) return;
          const current = productMap.get(name);
          if (current) {
            current.quantity += quantity;
            current.revenue += revenue;
          } else {
            productMap.set(name, { name, quantity, revenue });
          }
        });
      });

      const top = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setRecentOrders(recent);
      setTopProducts(top);
      setIsInsightsLoading(false);
    };

    void loadInsights();

    return () => {
      isActive = false;
    };
  }, [payments, scopeLabel]);

  const trendMeta = useMemo(() => buildTrendMeta(payments, trendRange), [payments, trendRange]);

  return {
    payments,
    isPaymentsLoading,
    recentOrders,
    topProducts,
    isInsightsLoading,
    trendMeta,
  };
};
