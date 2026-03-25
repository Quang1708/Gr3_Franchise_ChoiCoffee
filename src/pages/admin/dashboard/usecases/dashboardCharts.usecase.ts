import type { DashboardInfo } from "../models/dashboard.model";

export const sumCountMap = (input?: Record<string, number>) => {
  if (!input) return 0;
  return Object.values(input).reduce((sum, value) => sum + Number(value || 0), 0);
};

export const buildSummaryData = (
  dashboardInfo?: DashboardInfo | null,
  options: { useFranchiseCounts?: boolean } = {},
) => {
  const totalOrders = sumCountMap(dashboardInfo?.countOrders);
  const totalPayments = sumCountMap(dashboardInfo?.countPayments);
  const useFranchiseCounts = Boolean(options.useFranchiseCounts);

  const users = useFranchiseCounts
    ? dashboardInfo?.countUserFranchises ?? dashboardInfo?.countUsers ?? 0
    : dashboardInfo?.countUsers ?? 0;
  const customers = useFranchiseCounts
    ? dashboardInfo?.countCustomerFranchises ?? dashboardInfo?.countCustomers ?? 0
    : dashboardInfo?.countCustomers ?? 0;
  const products = useFranchiseCounts
    ? dashboardInfo?.countProductFranchises ?? dashboardInfo?.countProducts ?? 0
    : dashboardInfo?.countProducts ?? 0;

  return {
    users,
    userFranchises: dashboardInfo?.countUserFranchises ?? 0,
    customers,
    products,
    totalOrders,
    totalPayments,
  };
};

export const buildOrderStatusItems = (dashboardInfo?: DashboardInfo | null) => {
  const counts = dashboardInfo?.countOrders || {};
  const rows = [
    { key: "DRAFT", label: "Draft", icon: "package" },
    { key: "CONFIRMED", label: "Confirmed", icon: "heart" },
    { key: "PREPARING", label: "Preparing", icon: "building" },
    { key: "READY_FOR_PICKUP", label: "Ready for Pickup", icon: "package" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: "building" },
    { key: "COMPLETED", label: "Completed", icon: "heart" },
    { key: "CANCELED", label: "Canceled", icon: "package" },
  ];

  return rows.map((row) => ({
    ...row,
    count: Number((counts as Record<string, number>)[row.key] || 0),
  }));
};

export const buildOrderChartData = (
  items: Array<{ label: string; count: number }>,
) => items.map((item) => ({ name: item.label, value: item.count }));

export const buildPaymentChartData = (dashboardInfo?: DashboardInfo | null) => {
  const counts = dashboardInfo?.countPayments || {};
  const rows = [
    { key: "PENDING", label: "Pending" },
    { key: "PAID", label: "Paid" },
    { key: "REFUNDED", label: "Refunded" },
    { key: "FAILED", label: "Failed" },
  ];

  return rows.map((row) => ({
    name: row.label,
    value: Number((counts as Record<string, number>)[row.key] || 0),
  }));
};

export const buildDeliveryChartData = (dashboardInfo?: DashboardInfo | null) => {
  const counts = dashboardInfo?.countDeliveries || {};
  const rows = [
    { key: "ASSIGNED", label: "Assigned" },
    { key: "PICKING_UP", label: "Picking Up" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  return rows.map((row) => ({
    name: row.label,
    value: Number((counts as Record<string, number>)[row.key] || 0),
  }));
};

export const buildPerformancePercentage = (dashboardInfo?: DashboardInfo | null) => {
  const totalOrders = sumCountMap(dashboardInfo?.countOrders);
  const completed = Number(dashboardInfo?.countOrders?.COMPLETED || 0);
  if (!totalOrders) return 0;
  return Math.round((completed / totalOrders) * 100);
};

export const buildOrderCompletionSummary = (dashboardInfo?: DashboardInfo | null) => {
  const totalOrders = sumCountMap(dashboardInfo?.countOrders);
  const completed = Number(dashboardInfo?.countOrders?.COMPLETED || 0);
  const rate = totalOrders ? Math.round((completed / totalOrders) * 100) : 0;
  return { totalOrders, completed, rate };
};
