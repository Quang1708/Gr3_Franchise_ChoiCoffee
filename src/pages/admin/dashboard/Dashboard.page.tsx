import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  Users,
  ShoppingCart,
  AlertTriangle,
  Building2,
  Heart,
  Target,
  TrendingUp,
} from "lucide-react";
import { useAuthStore } from "../../../stores/auth.store";
import { useAdminContextStore } from "../../../stores/adminContext.store";
import type { DashboardInfo, InventoryAlertItem } from "./models/dashboard.model";
import {
  buildDeliveryChartData,
  buildOrderChartData,
  buildOrderCompletionSummary,
  buildOrderStatusItems,
  buildPaymentChartData,
  buildPerformancePercentage,
  buildSummaryData,
  getDashboardInfoUsecase,
  getLowStockAlertsUsecase,
} from "./usecases";
import { toastError } from "../../../utils/toast.util";
import ClientLoading from "../../../components/Client/Client.Loading";

const DashboardPage = () => {
  const { user } = useAuthStore();
  const selectedFranchiseId = useAdminContextStore((s) => s.selectedFranchiseId);
  const [dashboardInfo, setDashboardInfo] = useState<DashboardInfo | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [lowStockItems, setLowStockItems] = useState<InventoryAlertItem[]>([]);
  const [isLowStockLoading, setIsLowStockLoading] = useState(false);

  const userName = useMemo(() => {
    return user?.name || "Admin";
  }, [user]);

  useEffect(() => {
    const loadDashboardInfo = async () => {
      try {
        setIsDashboardLoading(true);
        const data = await getDashboardInfoUsecase(selectedFranchiseId);
        setDashboardInfo(data);
      } catch {
        setDashboardInfo(null);
        toastError("Cannot load dashboard data");
      } finally {
        setIsDashboardLoading(false);
      }
    };

    void loadDashboardInfo();
  }, [selectedFranchiseId]);

  useEffect(() => {
    const loadLowStock = async () => {
      if (!selectedFranchiseId) {
        setLowStockItems([]);
        return;
      }

      try {
        setIsLowStockLoading(true);
        const mapped = await getLowStockAlertsUsecase(String(selectedFranchiseId));
        setLowStockItems(mapped);
      } catch {
        setLowStockItems([]);
        toastError("Cannot load low stock data");
      } finally {
        setIsLowStockLoading(false);
      }
    };

    void loadLowStock();
  }, [selectedFranchiseId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "low":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (icon: string) => {
    switch (icon) {
      case "building":
        return <Building2 className="w-5 h-5" />;
      case "heart":
        return <Heart className="w-5 h-5" />;
      case "package":
        return <Package className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const COLORS = ["#e69019", "#3d2b1f", "#887863", "#333333"];

  const summaryData = useMemo(() => buildSummaryData(dashboardInfo), [dashboardInfo]);
  const orderStatusItems = useMemo(
    () => buildOrderStatusItems(dashboardInfo),
    [dashboardInfo],
  );
  const orderChartData = useMemo(
    () => buildOrderChartData(orderStatusItems),
    [orderStatusItems],
  );
  const paymentChartData = useMemo(
    () => buildPaymentChartData(dashboardInfo),
    [dashboardInfo],
  );
  const deliveryChartData = useMemo(
    () => buildDeliveryChartData(dashboardInfo),
    [dashboardInfo],
  );
  const performancePercentage = useMemo(
    () => buildPerformancePercentage(dashboardInfo),
    [dashboardInfo],
  );
  const completionSummary = useMemo(
    () => buildOrderCompletionSummary(dashboardInfo),
    [dashboardInfo],
  );
  const lastCheckLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);
  const visibleOrderStatusItems = useMemo(() => orderStatusItems, [orderStatusItems]);

  return (
    <div className="space-y-6 bg-[#f8f7f6]">
      {isDashboardLoading && <ClientLoading />}
      {/* Welcome Panel */}
      <div className="bg-linear-to-r from-[#3d2b1f] via-[#e69019] to-[#887863] rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold">Welcome Back {userName}</h2>
              <span className="text-2xl">👋</span>
            </div>
            {isDashboardLoading && (
              <p className="text-sm text-[#f8f7f6]">Loading dashboard data...</p>
            )}
            <p className="text-sm text-[#f8f7f6]">
              Overview of orders, payments, deliveries, and low stock.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-white/15 rounded-full flex items-center justify-center">
              <Target className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e5e1dc] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#333333] font-semibold">Users</h3>
            <Users className="w-5 h-5 text-[#e69019]" />
          </div>
          <p className="text-3xl font-bold text-[#333333] mb-2">
            {summaryData.users.toLocaleString()}
          </p>
          <p className="text-sm text-[#887863]">Total users</p>
        </div>

        {/* Customers Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e5e1dc] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#333333] font-semibold">Customers</h3>
            <Heart className="w-5 h-5 text-[#e69019]" />
          </div>
          <p className="text-3xl font-bold text-[#333333] mb-2">
            {summaryData.customers.toLocaleString()}
          </p>
          <p className="text-sm text-[#887863]">Total customers</p>
        </div>

        {/* Products Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e5e1dc] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#333333] font-semibold">Products</h3>
            <Package className="w-5 h-5 text-[#e69019]" />
          </div>
          <p className="text-3xl font-bold text-[#333333] mb-2">
            {summaryData.products.toLocaleString()}
          </p>
          <p className="text-sm text-[#887863]">Total products</p>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e5e1dc] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#333333] font-semibold">Orders</h3>
            <ShoppingCart className="w-5 h-5 text-[#e69019]" />
          </div>
          <p className="text-3xl font-bold text-[#333333] mb-2">
            {summaryData.totalOrders.toLocaleString()}
          </p>
          <p className="text-sm text-[#887863]">Total orders</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e5e1dc] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
                Orders by Status
              </h3>
              <p className="text-sm text-[#887863]">Current totals</p>
            </div>
          </div>
          <div className="h-64 mt-4 min-h-[256px] w-full relative">
            <div style={{ width: "100%", height: "256px", minHeight: "256px" }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                <BarChart data={orderChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#e69019" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Payments by Status */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e5e1dc] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[#333333]">Payments by Status</h3>
              <p className="text-sm text-[#887863]">Current totals</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">Updated</span>
            </div>
          </div>
          <div className="h-64 mt-4 min-h-[256px] w-full relative">
            <div style={{ width: "100%", height: "256px", minHeight: "256px" }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                <BarChart data={paymentChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3d2b1f" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Performance and Sales Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e5e1dc] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#333333]">Order Status Summary</h3>
              <p className="text-sm text-[#887863]">Checked {lastCheckLabel}</p>
            </div>
            <span className="text-xs text-[#887863]">
              Completed {completionSummary.completed}/{completionSummary.totalOrders}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibleOrderStatusItems.length === 0 && (
                <div className="text-sm text-gray-500">No order activity yet.</div>
              )}
              {visibleOrderStatusItems.map((order) => (
                <div
                  key={order.key}
                  className="flex items-center gap-3 p-2.5 bg-[#f8f7f6] rounded-lg"
                >
                  <div className="w-8 h-8 bg-[#f3ece2] rounded-lg flex items-center justify-center text-[#3d2b1f]">
                    {getStatusIcon(order.icon)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#333333]">{order.count}</p>
                    <p className="text-xs text-[#887863]">{order.label}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e69019"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(performancePercentage / 100) * 351.86} 351.86`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[#333333]">
                    {performancePercentage}%
                  </span>
                  <span className="text-xs text-[#887863]">Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Alerts - US-2.3 */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e5e1dc] p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-[#333333]">Inventory Alerts</h3>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {isLowStockLoading && (
              <div className="text-sm text-[#887863]">Loading low stock items...</div>
            )}
            {!isLowStockLoading && !selectedFranchiseId && (
              <div className="text-sm text-[#887863]">
                Select a franchise to view low stock items.
              </div>
            )}
            {!isLowStockLoading && selectedFranchiseId && lowStockItems.length === 0 && (
              <div className="text-sm text-[#887863]">No low stock items.</div>
            )}
            {lowStockItems.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border-2 ${getStatusColor(alert.status)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold">{alert.productName}</p>
                  <span className="text-xs font-medium px-2 py-0.5 rounded">
                    {alert.status.toUpperCase()}
                  </span>
                </div>
                  <p className="text-xs text-gray-600 mb-1">{alert.category}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-600">
                    Stock: <span className="font-semibold">{alert.currentStock}</span>
                  </span>
                  <span className="text-xs text-gray-600">
                    Min: <span className="font-semibold">{alert.minStock}</span>
                  </span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      alert.status === "critical"
                        ? "bg-red-500"
                        : alert.status === "low"
                        ? "bg-orange-500"
                        : "bg-yellow-500"
                    }`}
                    style={{
                      width: `${
                        alert.minStock > 0
                          ? Math.min((alert.currentStock / alert.minStock) * 100, 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deliveries Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-[#e5e1dc] p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#333333]">Deliveries Overview</h3>
          <p className="text-sm text-[#887863]">Current totals</p>
        </div>
        <div className="h-64 min-h-[256px] w-full relative">
          <div style={{ width: "100%", height: "256px", minHeight: "256px" }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
              <PieChart>
              <Pie
                data={deliveryChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {deliveryChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
