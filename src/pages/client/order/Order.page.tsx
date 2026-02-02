import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {

    Calendar,
    ShoppingBag,
    Truck,
    CheckCircle2,
    Wallet,
    Eye
} from "lucide-react";
import ClientHeader from "../../../layouts/client/ClientHeader.layout";
import ClientFooter from "../../../layouts/client/ClientFooter.layout";
import ROUTER_URL from "../../../routes/router.const";
import { FAKE_ORDERS } from "../../../mocks/dataOder.const";
import type { OrderData } from "../../../mocks/dataOder.const";

// Interface for display
interface Order {
    id: string;
    orderCode: string;
    orderDate: string;
    orderTime: string;
    totalAmount: number;
    status: "processing" | "delivering" | "completed";
}

type OrderStatus = "all" | "processing" | "delivering" | "completed";

// Helper function to map OrderData to Order
const mapOrderDataToOrder = (orderData: OrderData): Order => {
    const date = new Date(orderData.created_at);
    const orderDate = date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const orderTime = date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    // Calculate total amount from items
    const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Map status: Pending/Processing -> processing, Completed -> completed
    // Note: "Cancelled" orders are filtered out, "Processing" can be considered as "delivering" in some cases
    let status: "processing" | "delivering" | "completed";
    if (orderData.status === "Completed") {
        status = "completed";
    } else if (orderData.status === "Processing") {
        status = "processing";
    } else {
        status = "processing"; // Pending -> processing
    }

    return {
        id: orderData.id,
        orderCode: orderData.id,
        orderDate,
        orderTime,
        totalAmount,
        status
    };
};

// Filter out cancelled orders and map to display format
const orders: Order[] = FAKE_ORDERS
    .filter(order => order.status !== "Cancelled")
    .map(mapOrderDataToOrder);

const OrderPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<OrderStatus>("all");
    const [searchQuery] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            if (activeTab !== "all" && order.status !== activeTab) {
                return false;
            }
            if (searchQuery && !order.orderCode.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            return true;
        });
    }, [activeTab, searchQuery]);

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

    // Calculate statistics
    const stats = useMemo(() => {
        return {
            processing: orders.filter(o => o.status === "processing").length,
            delivering: orders.filter(o => o.status === "delivering").length,
            completed: orders.filter(o => o.status === "completed").length,
            monthlySpending: orders.reduce((sum, o) => sum + o.totalAmount, 0)
        };
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(amount).replace("₫", "₫");
    };

    const getStatusBadge = (status: Order["status"]) => {
        const statusConfig = {
            processing: {
                label: "Đang xử lý",
                className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                dot: "bg-blue-500"
            },
            delivering: {
                label: "Đang giao",
                className: "bg-orange-500/20 text-orange-400 border-orange-500/30",
                dot: "bg-orange-500"
            },
            completed: {
                label: "Hoàn thành",
                className: "bg-green-500/20 text-green-400 border-green-500/30",
                dot: "bg-green-500"
            }
        };

        const config = statusConfig[status];
        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}>
                <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
                {config.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-background-light">
            {/* Client Header */}
            <ClientHeader />

            <div className="flex flex-1 overflow-hidden">


                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Main Content */}
                    <main className="flex-1 p-6 overflow-y-auto bg-background-light">
                        {/* Breadcrumbs */}
                        <nav className="mb-4 text-sm text-gray-600">
                            <span className="hover:text-primary cursor-pointer">Trang chủ</span>
                            <span className="mx-2">/</span>
                            <span className="text-gray-800 font-medium">Danh sách đơn hàng</span>
                        </nav>

                        {/* Page Title */}
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-charcoal mb-2">Danh sách Đơn hàng của tôi</h2>
                            <p className="text-gray-600">
                                Theo dõi và quản lý các đơn hàng nhập hàng của hệ thống ChoiCoffee
                            </p>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
                            {/* Processing Card */}
                            <div className="bg-white rounded-lg  p-6  border-blue-500 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Đang xử lý</p>
                                        <p className="text-3xl font-bold text-charcoal">{stats.processing}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                        <ShoppingBag className="text-blue-400" size={24} />
                                    </div>
                                </div>
                            </div>

                            {/* Delivering Card */}
                            <div className="bg-white rounded-lg  p-6   border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Đang giao</p>
                                        <p className="text-3xl font-bold text-charcoal">{stats.delivering}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                        <Truck className="text-orange-400" size={24} />
                                    </div>
                                </div>
                            </div>

                            {/* Completed Card */}
                            <div className="bg-white rounded-lg  p-6   border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Đã hoàn thành</p>
                                        <p className="text-3xl font-bold text-charcoal">{stats.completed}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                                        <CheckCircle2 className="text-green-400" size={24} />
                                    </div>
                                </div>
                            </div>

                            {/* Monthly Spending Card */}
                            <div className="bg-white rounded-lg  p-6  border border-gray-200 ">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Tổng chi tiêu tháng này</p>
                                        <p className="text-2xl font-bold text-charcoal">{formatCurrency(stats.monthlySpending)}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center  ">
                                        <Wallet className="text-primary" size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Orders Section Frame */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 border border-gray-200">
                            {/* Status Tabs */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex gap-6">
                                    {[
                                        { key: "all", label: "Tất cả" },
                                        { key: "processing", label: "Đang xử lý" },
                                        { key: "delivering", label: "Đang giao" },
                                        { key: "completed", label: "Đã hoàn thành" }
                                    ].map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => {
                                                setActiveTab(tab.key as OrderStatus);
                                                setCurrentPage(1);
                                            }}
                                            className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === tab.key
                                                ? "text-primary"
                                                : "text-gray-600 hover:text-charcoal"
                                                }`}
                                        >
                                            {tab.label}
                                            {activeTab === tab.key && (
                                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Date Filters */}
                                <div className="mt-6 flex items-center gap-4 flex-wrap pt-5 border-t border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-600 whitespace-nowrap">Từ ngày:</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="date"
                                                value={fromDate}
                                                onChange={(e) => setFromDate(e.target.value)}
                                                className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-charcoal"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-600 whitespace-nowrap">Đến ngày:</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="date"
                                                value={toDate}
                                                onChange={(e) => setToDate(e.target.value)}
                                                className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-charcoal"
                                            />
                                        </div>
                                    </div>

                                    <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
                                        Lọc kết quả
                                    </button>

                                    <div className="ml-auto text-sm text-gray-600">
                                        Hiển thị {startIndex + 1} – {Math.min(startIndex + itemsPerPage, filteredOrders.length)} của {filteredOrders.length} đơn hàng
                                    </div>
                                </div>
                            </div>

                            {/* Order Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                                                MÃ ĐƠN HÀNG
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                                                NGÀY ĐẶT
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                                                TỔNG TIỀN
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                                                TRẠNG THÁI
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                                                THAO TÁC
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {paginatedOrders.length > 0 ? (
                                            paginatedOrders.map((order) => (
                                                <tr
                                                    key={order.id}
                                                    className="transition-colors border-b border-gray-200 hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-semibold text-charcoal">#{order.orderCode}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600">
                                                            {order.orderDate} - {order.orderTime}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-semibold text-charcoal">
                                                            {formatCurrency(order.totalAmount)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(order.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <button
                                                                onClick={() => navigate(ROUTER_URL.CLIENT_ROUTER.CLIENT_ORDER_DETAIL.replace(':orderId', order.id))}
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                                                            >
                                                                <Eye size={16} />
                                                                Xem chi tiết
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                    Không có đơn hàng nào
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        &lt;
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-4 py-2 rounded-lg transition-colors ${currentPage === page
                                                ? "bg-primary text-white"
                                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </div>

                    </main>
                </div>
            </div>

            {/* Client Footer */}
            <ClientFooter />
        </div>
    );
};

export default OrderPage;
