export type DashboardOrderCounts = {
  DRAFT?: number;
  CONFIRMED?: number;
  PREPARING?: number;
  READY_FOR_PICKUP?: number;
  OUT_FOR_DELIVERY?: number;
  COMPLETED?: number;
  CANCELED?: number;
};

export type DashboardPaymentCounts = {
  PENDING?: number;
  PAID?: number;
  REFUNDED?: number;
  FAILED?: number;
};

export type DashboardDeliveryCounts = {
  ASSIGNED?: number;
  PICKING_UP?: number;
  DELIVERED?: number;
};

export type DashboardInfo = {
  countUsers: number;
  countUserFranchises: number;
  countCustomers: number;
  countCustomerFranchises: number;
  countProducts: number;
  countProductFranchises: number;
  countOrders: DashboardOrderCounts;
  countPayments: DashboardPaymentCounts;
  countDeliveries: DashboardDeliveryCounts;
};

export type TrendRange = "today" | "7d" | "30d";

export type TrendDirection = "up" | "down" | "flat";

export type TrendStats = {
  pct: number | null;
  direction: TrendDirection;
};

export type TrendMeta = {
  label: string;
  compareLabel: string;
  currentRevenue: number;
  prevRevenue: number;
  currentOrders: number;
  prevOrders: number;
  avgOrderValue: number;
  revenueChange: TrendStats;
  ordersChange: TrendStats;
};

export type RecentOrderItem = {
  id: string;
  code: string;
  customerName: string;
  franchiseName: string;
  status: string;
  amount: number;
  dateLabel: string;
};

export type TopProductItem = {
  name: string;
  quantity: number;
  revenue: number;
};

export type InventoryAlertItem = {
  id: string;
  productName: string;
  currentStock: number;
  minStock: number;
  status: "critical" | "low" | "warning";
  category: string;
};
