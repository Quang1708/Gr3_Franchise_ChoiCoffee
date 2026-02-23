import { useMemo, useState } from "react";
import {
  ArrowUp,
  Eye,
  Filter,
  MoreVertical,
  Search,
  ShoppingBag,
  Truck,
  Wallet,
  CheckCircle2,
  RotateCcw,
  MoreHorizontal,
} from "lucide-react";
import ROUTER_URL from "../../../routes/router.const";
import { ORDER_SEED_DATA } from "../../../mocks/order.seed";
import { FRANCHISE_SEED_DATA } from "../../../mocks/franchise.seed";
import type { Order as OrderModel } from "../../../models/order.model";
import { useNavigate } from "react-router-dom";

interface OrderDisplay {
  id: string;
  orderCode: string;
  orderDate: string;
  orderTime: string;
  franchiseName: string;
  totalAmount: number;
  status: "processing" | "delivering" | "completed" | "cancelled";
  paymentStatus: "paid" | "pending" | "cancelled";
}

const mapOrderToDisplay = (order: OrderModel): OrderDisplay => {
  const date = new Date(order.createdAt);
  const orderDate = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const orderTime = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const franchise = FRANCHISE_SEED_DATA.find(
    (f) => f.id === order.franchiseId,
  );

  let status: OrderDisplay["status"];
  if (order.status === "COMPLETED") {
    status = "completed";
  } else if (order.status === "PREPARING") {
    status = "delivering";
  } else if (order.status === "CANCELLED") {
    status = "cancelled";
  } else {
    status = "processing";
  }

  let paymentStatus: OrderDisplay["paymentStatus"];
  if (order.status === "COMPLETED") {
    paymentStatus = "paid";
  } else if (order.status === "CANCELLED") {
    paymentStatus = "cancelled";
  } else {
    paymentStatus = "pending";
  }

  return {
    id: order.id.toString(),
    orderCode: order.code,
    orderDate,
    orderTime,
    franchiseName: franchise?.name ?? "ChoiCoffee - Quận 1",
    totalAmount: order.totalAmount,
    status,
    paymentStatus,
  };
};

const allOrders: OrderDisplay[] = ORDER_SEED_DATA.filter(
  (o) => !o.isDeleted,
).map(mapOrderToDisplay);

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })
    .format(amount)
    .replace("₫", "₫");

const ClientHistoryPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const stats = useMemo(() => {
    const totalOrders = allOrders.length;
    const totalSpending = allOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0,
    );

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const newOrders24h = allOrders.filter((o) => {
      const orderDate = new Date(
        `${o.orderDate.split("/").reverse().join("-")} ${o.orderTime}`,
      );
      return orderDate >= yesterday;
    }).length;

    return { totalOrders, totalSpending, newOrders24h };
  }, []);

  const filteredOrders = useMemo(
    () =>
      allOrders.filter((order) =>
        searchQuery
          ? order.orderCode.toLowerCase().includes(searchQuery.toLowerCase())
          : true,
      ),
    [searchQuery],
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getStatusBadge = (status: OrderDisplay["status"]) => {
    const config: Record<
      OrderDisplay["status"],
      { label: string; className: string }
    > = {
      processing: {
        label: "Đang xử lý",
        className: "bg-orange-500/20 text-orange-600 border-orange-500/30",
      },
      delivering: {
        label: "Đang giao",
        className: "bg-blue-500/20 text-blue-600 border-blue-500/30",
      },
      completed: {
        label: "Hoàn thành",
        className: "bg-green-500/20 text-green-600 border-green-500/30",
      },
      cancelled: {
        label: "Đã hủy",
        className: "bg-red-500/20 text-red-600 border-red-500/30",
      },
    };

    const c = config[status];
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${c.className}`}
      >
        {c.label}
      </span>
    );
  };

  const getPaymentIcon = (status: OrderDisplay["paymentStatus"]) => {
    if (status === "paid") {
      return <CheckCircle2 className="text-green-500" size={18} />;
    }
    if (status === "cancelled") {
      return <RotateCcw className="text-red-500" size={18} />;
    }
    return <MoreHorizontal className="text-gray-400" size={18} />;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6">
        <nav className="mb-4 text-sm text-gray-600">
          <span
            className="hover:text-primary cursor-pointer"
            onClick={() => navigate("/")}
          >
            Trang chủ
          </span>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium">Lịch sử Đơn hàng</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Lịch sử Đơn hàng
          </h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm mã đơn hàng..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm w-64"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng đơn hàng</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalOrders.toLocaleString("vi-VN")}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="text-green-500" size={14} />
                  <span className="text-sm text-green-500">
                    +12.5% so với tháng trước
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-blue-500" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng chi tiêu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalSpending)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="text-green-500" size={14} />
                  <span className="text-sm text-green-500">+8.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Wallet className="text-green-500" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Đơn hàng mới (24h)
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.newOrders24h}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Dự kiến giao trong hôm nay
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Truck className="text-orange-500" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách đơn hàng
            </h2>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                <Filter size={16} />
                Bộ lọc
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    MÃ ĐƠN HÀNG
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    NGÀY ĐẶT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ĐỐI TÁC/CỬA HÀNG
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    TỔNG TIỀN
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    TRẠNG THÁI
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    THANH TOÁN
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    THAO TÁC
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          #{order.orderCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {order.orderDate} {order.orderTime}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {order.franchiseName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getPaymentIcon(order.paymentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                ROUTER_URL.CLIENT_ROUTER.CLIENT_ORDER_DETAIL.replace(
                                  ":orderId",
                                  order.id,
                                ),
                              )
                            }
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="text-gray-600" size={18} />
                          </button>
                          <button
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Thêm tùy chọn"
                          >
                            <MoreVertical className="text-gray-600" size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Không có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {startIndex + 1}–
              {Math.min(startIndex + itemsPerPage, filteredOrders.length)} của{" "}
              {filteredOrders.length} đơn hàng
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                      currentPage === page
                        ? "bg-primary text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(totalPages, prev + 1),
                  )
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientHistoryPage;

