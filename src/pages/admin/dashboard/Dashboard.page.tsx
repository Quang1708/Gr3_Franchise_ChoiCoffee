import { useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  ShoppingCart,
  Store,
  AlertTriangle,
  Building2,
  Heart,
  Target,
  DollarSign,
} from "lucide-react";
import { useAuthStore } from "../../../stores/auth.store";
import {
  revenueForecastData,
  customerData,
  salesOverviewData,
  productRevenueData,
  inventoryAlerts,
  orderStatusData,
  settlementsData,
  dashboardStats,
  budgetData,
} from "../../../mocks/Dashboard.mock";

const DashboardPage = () => {
  const { user } = useAuthStore();

  const userName = useMemo(() => {
    return user?.name || "Admin";
  }, [user]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Very High":
        return "bg-blue-100 text-blue-800";
      case "High":
        return "bg-pink-100 text-pink-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

  const COLORS = ["#8B5CF6", "#EC4899", "#14B8A6", "#94A3B8"];

  // Calculate performance percentage (mock calculation)
  const performancePercentage = 75;

  return (
    <div className="space-y-6">
      {/* Welcome Panel */}
      <div className="bg-linear-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold">Welcome Back {userName}</h2>
              <span className="text-2xl">👋</span>
            </div>
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div>
                <p className="text-purple-200 text-sm mb-1">Budget</p>
                <p className="text-3xl font-bold">${budgetData.budget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-purple-200 text-sm mb-1">Expense</p>
                <p className="text-3xl font-bold">${budgetData.expense.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
              <Target className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Customers Card */}
        <div className="bg-linear-to-br from-teal-50 to-teal-100 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-semibold">Customers</h3>
            <Users className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-2">
            {dashboardStats.totalCustomers.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            {dashboardStats.customersChange < 0 ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : (
              <TrendingUp className="w-4 h-4 text-green-500" />
            )}
            <span
              className={`text-sm font-medium ${
                dashboardStats.customersChange < 0 ? "text-red-500" : "text-green-500"
              }`}
            >
              {Math.abs(dashboardStats.customersChange)}%
            </span>
          </div>
          <div className="mt-4 h-12 min-h-[48px] w-full relative">
            <div style={{ width: "100%", height: "48px", minHeight: "48px" }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={48}>
                <AreaChart data={customerData.slice(-5)}>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#14B8A6"
                    fill="#14B8A6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-linear-to-br from-pink-50 to-pink-100 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-semibold">Orders</h3>
            <ShoppingCart className="w-5 h-5 text-pink-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-2">
            {dashboardStats.totalOrders.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-500">
              +{dashboardStats.ordersChange}%
            </span>
          </div>
          <div className="mt-4 h-12 min-h-[48px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={48}>
              <AreaChart data={customerData.slice(-5)}>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#EC4899"
                  fill="#EC4899"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-semibold">Revenue</h3>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-2">
            ${dashboardStats.totalRevenue.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-500">
              +{dashboardStats.revenueChange}%
            </span>
          </div>
          <div className="mt-4 h-12 min-h-[48px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={48}>
              <AreaChart data={customerData.slice(-5)}>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Franchises Card */}
        <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-semibold">Franchises</h3>
            <Store className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-2">
            {dashboardStats.totalFranchises}
          </p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-500">
              +{dashboardStats.franchisesChange}%
            </span>
          </div>
          <div className="mt-4 h-12 min-h-[48px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={48}>
              <AreaChart data={customerData.slice(-5)}>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Forecast */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span>📊</span> Revenue Forecast
              </h3>
              <p className="text-sm text-gray-500">Overview of Profit</p>
            </div>
          </div>
          <div className="h-64 mt-4 min-h-[256px] w-full relative">
            <div style={{ width: "100%", height: "256px", minHeight: "256px" }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                <LineChart data={revenueForecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value2024"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="2024"
                  dot={{ fill: "#3B82F6", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="value2023"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="2023"
                  dot={{ fill: "#EF4444", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="value2022"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="2022"
                  dot={{ fill: "#10B981", r: 4 }}
                />
              </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Customers Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Customers</h3>
              <p className="text-sm text-gray-500">Last 7 days</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">+26.5%</span>
            </div>
          </div>
          <div className="h-64 mt-4 min-h-[256px] w-full relative">
            <div style={{ width: "100%", height: "256px", minHeight: "256px" }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                <AreaChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.2}
                />
              </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Apr 07 - Apr 14</p>
              <p className="text-lg font-semibold text-gray-800">6,380</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Last Week</p>
              <p className="text-lg font-semibold text-gray-800">4,298</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance and Sales Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Performance */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Your Performance</h3>
            <p className="text-sm text-gray-500">Last check on 25 February</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              {orderStatusData.map((order, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                    {getStatusIcon(order.icon)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {order.count} {order.status === "On hold" ? "orders" : "new orders"}
                    </p>
                    <p className="text-xs text-gray-500">{order.status}</p>
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
                    stroke="#8B5CF6"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(performancePercentage / 100) * 351.86} 351.86`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-800">{performancePercentage}</span>
                  <span className="text-xs text-gray-500">Performance</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Sales Overview</h3>
            <p className="text-sm text-gray-500">Last 7 days</p>
          </div>
          <div className="h-64 min-h-[256px] w-full relative">
            <div style={{ width: "100%", height: "256px", minHeight: "256px" }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                <PieChart>
                <Pie
                  data={salesOverviewData}
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
                  {salesOverviewData.map((_, index) => (
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

      {/* Revenue by Product and Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by Product */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Revenue by Product</h3>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
              <option>Sept 2024</option>
            </select>
          </div>
          <div className="flex gap-2 mb-4">
            {["App", "Mobile", "Sass", "Others"].map((filter) => (
              <button
                key={filter}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === "App"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Assigned
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Progress
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Priority
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Budget
                  </th>
                </tr>
              </thead>
              <tbody>
                {productRevenueData.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.assignedAvatar}
                          alt={product.assigned}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.assigned}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${product.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-700">{product.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          product.priority
                        )}`}
                      >
                        {product.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-800">{product.budget}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Alerts - US-2.3 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-800">Inventory Alerts</h3>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {inventoryAlerts.map((alert) => (
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
                      width: `${Math.min((alert.currentStock / alert.minStock) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Total Settlements */}
      <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">Total Settlements</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-3xl font-bold text-gray-800 mb-2">$122,580</p>
            <p className="text-sm text-gray-600">Total settlements</p>
          </div>
          <div className="lg:col-span-2 h-48 min-h-[192px] w-full relative">
            <div style={{ width: "100%", height: "192px", minHeight: "192px" }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={192}>
                <AreaChart data={settlementsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="week" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total balance</p>
            <p className="text-xl font-semibold text-gray-800">$122,580</p>
          </div>
          <div className="bg-white/50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Withdrawals</p>
            <p className="text-xl font-semibold text-gray-800">$31,640</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
