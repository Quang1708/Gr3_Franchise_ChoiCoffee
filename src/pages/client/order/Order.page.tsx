import { useState } from "react";
import {
    Search,
    Bell,
    Calendar,
    ShoppingBag,
    Truck,
    CheckCircle2,
    Wallet,
    Eye
} from "lucide-react";
import ClientOrderSidebar from "./ClientOrderSidebar";

// Mock data - thay thế bằng data thực từ API
interface Order {
    id: string;
    orderCode: string;
    orderDate: string;
    orderTime: string;
    totalAmount: number;
    status: "processing" | "delivering" | "completed";
}

const mockOrders: Order[] = [
    {
        id: "1",
        orderCode: "CC-ORD-99812",
        orderDate: "24/05/2024",
        orderTime: "14:30",
        totalAmount: 5400000,
        status: "processing"
    },
    {
        id: "2",
        orderCode: "CC-ORD-99750",
        orderDate: "22/05/2024",
        orderTime: "09:15",
        totalAmount: 12850000,
        status: "delivering"
    },
    {
        id: "3",
        orderCode: "CC-ORD-99602",
        orderDate: "20/05/2024",
        orderTime: "16:45",
        totalAmount: 2100000,
        status: "completed"
    },
    {
        id: "4",
        orderCode: "CC-ORD-99580",
        orderDate: "18/05/2024",
        orderTime: "11:20",
        totalAmount: 8600000,
        status: "completed"
    },
    {
        id: "5",
        orderCode: "CC-ORD-99415",
        orderDate: "15/05/2024",
        orderTime: "08:30",
        totalAmount: 4200000,
        status: "completed"
    }
];

type OrderStatus = "all" | "processing" | "delivering" | "completed";

const OrderPage = () => {
    const [activeTab, setActiveTab] = useState<OrderStatus>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Filter orders based on active tab
    const filteredOrders = mockOrders.filter(order => {
        if (activeTab !== "all" && order.status !== activeTab) {
            return false;
        }
        if (searchQuery && !order.orderCode.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        return true;
    });

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

    // Calculate statistics
    const stats = {
        processing: mockOrders.filter(o => o.status === "processing").length,
        delivering: mockOrders.filter(o => o.status === "delivering").length,
        completed: mockOrders.filter(o => o.status === "completed").length,
        monthlySpending: mockOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    };

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
        <div className="fixed inset-0 flex overflow-hidden" style={{ backgroundColor: '#181511' }}>
            {/* Sidebar */}
            <aside className="w-64 border-r border-espresso flex-shrink-0 h-full" style={{ backgroundColor: '#181511' }}>
                <ClientOrderSidebar />
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="border-b border-espresso px-6 py-4" style={{ backgroundColor: '#181511' }}>
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-white">Quản lý Đơn hàng</h1>

                        <div className="flex items-center gap-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-clay" size={20} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm mã đơn..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-espresso border border-charcoal rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64 text-white placeholder-clay"
                                />
                            </div>

                            {/* Notification Bell */}
                            <button className="relative p-2 text-clay hover:text-white hover:bg-espresso rounded-lg transition-colors">
                                <Bell size={20} />
                            </button>

                            {/* User Profile */}
                            <div className="flex items-center gap-3 pl-4 border-l border-espresso">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-white">Lê Trung Hiếu</p>
                                    <p className="text-xs text-clay">Cửa hàng Quận 1</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                                    LH
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-6 overflow-y-auto" style={{ backgroundColor: '#181511' }}>
                    {/* Breadcrumbs */}
                    <nav className="mb-4 text-sm text-clay">
                        <span className="hover:text-primary cursor-pointer">Trang chủ</span>
                        <span className="mx-2">/</span>
                        <span className="text-clay font-medium">Danh sách đơn hàng</span>
                    </nav>

                    {/* Page Title */}
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-white mb-2">Danh sách Đơn hàng của tôi</h2>
                        <p className="text-clay">
                            Theo dõi và quản lý các đơn hàng nhập hàng của hệ thống ChoiCoffee
                        </p>
                    </div>

                    {/* Orders Section Frame */}
                    <div
                        className="rounded-lg shadow-sm overflow-hidden mb-6"
                        style={{
                            background: "rgba(33, 26, 17, 0.8)",
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255, 255, 255, 0.08)"
                        }}
                    >
                        {/* Status Tabs */}
                        <div className="p-6" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
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
                                            : "text-clay hover:text-white"
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
                            <div className="mt-6 flex items-center gap-4 flex-wrap pt-5 border-t" style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-clay whitespace-nowrap">Từ ngày:</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-clay" size={18} />
                                        <input
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            className="pl-10 pr-4 py-2 bg-espresso border border-charcoal rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-clay whitespace-nowrap">Đến ngày:</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-clay" size={18} />
                                        <input
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            className="pl-10 pr-4 py-2 bg-espresso border border-charcoal rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white"
                                        />
                                    </div>
                                </div>

                                <button className="px-6 py-2 bg-charcoal border border-espresso text-clay rounded-lg hover:bg-espresso hover:text-white transition-colors font-medium">
                                    Lọc kết quả
                                </button>

                                <div className="ml-auto text-sm text-clay">
                                    Hiển thị {startIndex + 1} – {Math.min(startIndex + itemsPerPage, filteredOrders.length)} của {filteredOrders.length} đơn hàng
                                </div>
                            </div>
                        </div>

                        {/* Order Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr
                                        className="border-b"
                                        style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
                                    >
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-clay uppercase tracking-wider" style={{ backgroundColor: 'rgba(33, 26, 17, 0.9)' }}>
                                            MÃ ĐƠN HÀNG
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-clay uppercase tracking-wider" style={{ backgroundColor: 'rgba(33, 26, 17, 0.9)' }}>
                                            NGÀY ĐẶT
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-clay uppercase tracking-wider" style={{ backgroundColor: 'rgba(33, 26, 17, 0.9)' }}>
                                            TỔNG TIỀN
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-clay uppercase tracking-wider" style={{ backgroundColor: 'rgba(33, 26, 17, 0.9)' }}>
                                            TRẠNG THÁI
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-clay uppercase tracking-wider" style={{ backgroundColor: 'rgba(33, 26, 17, 0.9)' }}>
                                            THAO TÁC
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedOrders.length > 0 ? (
                                        paginatedOrders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="transition-colors border-b"
                                                style={{
                                                    borderColor: "rgba(255, 255, 255, 0.08)",
                                                    backgroundColor: "transparent"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(61, 43, 31, 0.35)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-semibold text-white">#{order.orderCode}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-clay">
                                                        {order.orderDate} - {order.orderTime}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-semibold text-white">
                                                        {formatCurrency(order.totalAmount)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(order.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                                                            <Eye size={16} />
                                                            Xem chi tiết
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-clay">
                                                Không có đơn hàng nào
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-espresso flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 bg-espresso border border-charcoal text-clay rounded-lg hover:bg-charcoal disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    &lt;
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-4 py-2 rounded-lg transition-colors ${currentPage === page
                                            ? "bg-primary text-white"
                                            : "bg-espresso border border-charcoal text-clay hover:bg-charcoal"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 bg-espresso border border-charcoal text-clay rounded-lg hover:bg-charcoal disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    &gt;
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Processing Card */}
                        <div
                            className="rounded-lg shadow-sm p-6 border-l-4 border-blue-500"
                            style={{
                                background: "rgba(33, 26, 17, 0.8)",
                                backdropFilter: "blur(12px)",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                borderLeft: "4px solid rgb(59, 130, 246)"
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-clay mb-1">Đang xử lý</p>
                                    <p className="text-3xl font-bold text-white">{stats.processing}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <ShoppingBag className="text-blue-400" size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Delivering Card */}
                        <div
                            className="rounded-lg shadow-sm p-6 border-l-4 border-orange-500"
                            style={{
                                background: "rgba(33, 26, 17, 0.8)",
                                backdropFilter: "blur(12px)",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                borderLeft: "4px solid rgb(249, 115, 22)"
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-clay mb-1">Đang giao</p>
                                    <p className="text-3xl font-bold text-white">{stats.delivering}</p>
                                </div>
                                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                    <Truck className="text-orange-400" size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Completed Card */}
                        <div
                            className="rounded-lg shadow-sm p-6 border-l-4 border-green-500"
                            style={{
                                background: "rgba(33, 26, 17, 0.8)",
                                backdropFilter: "blur(12px)",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                borderLeft: "4px solid rgb(34, 197, 94)"
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-clay mb-1">Đã hoàn thành</p>
                                    <p className="text-3xl font-bold text-white">{stats.completed}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <CheckCircle2 className="text-green-400" size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Monthly Spending Card */}
                        <div
                            className="rounded-lg shadow-sm p-6 border-l-4 border-primary"
                            style={{
                                background: "rgba(33, 26, 17, 0.8)",
                                backdropFilter: "blur(12px)",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                borderLeft: "4px solid #e69019"
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-clay mb-1">Tổng chi tiêu tháng này</p>
                                    <p className="text-2xl font-bold text-white">{formatCurrency(stats.monthlySpending)}</p>
                                </div>
                                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                                    <Wallet className="text-primary" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OrderPage;
