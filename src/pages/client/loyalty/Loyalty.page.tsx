import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Star,
    Gift,
    Filter,
    ArrowUp,
    Search,
    CheckCircle2,
    Clock,
} from "lucide-react";
import { LOYALTY_TRANSACTION_SEED_DATA } from "../../../mocks/loyalty_transaction.seed";
import { CUSTOMER_FRANCHISE_SEED_DATA } from "../../../mocks/customer_franchise.seed";
import { CUSTOMER_SEED_DATA } from "../../../mocks/customer.seed";
import { ORDER_SEED_DATA } from "../../../mocks/order.seed";
import ROUTER_URL from "../../../routes/router.const";
import type { LoyaltyTransaction } from "../../../models/loyalty_transaction.model";


// Interface for display
interface TransactionDisplay {
    id: string;
    date: string;
    time: string;
    content: string;
    category: "PURCHASE" | "REDEEM_REWARD" | "REFERRAL" | "SERVICE";
    points: number;
    status: "success" | "processing";
}

// Helper function to map transaction type to category
const mapTransactionTypeToCategory = (
    type: LoyaltyTransaction["type"],
    reason?: string,
): TransactionDisplay["category"] => {
    if (type === "EARN") {
        if (reason?.includes("giới thiệu") || reason?.includes("referral")) {
            return "REFERRAL";
        }
        if (reason?.includes("dịch vụ") || reason?.includes("phí")) {
            return "SERVICE";
        }
        return "PURCHASE";
    }
    if (type === "REDEEM") {
        return "REDEEM_REWARD";
    }
    return "SERVICE";
};

// Helper function to map LoyaltyTransaction to TransactionDisplay
const mapTransactionToDisplay = (
    transaction: LoyaltyTransaction,
): TransactionDisplay => {
    const date = new Date(transaction.createdAt);
    const transactionDate = date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    const transactionTime = date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    });

    // Get order info if available
    const order = transaction.orderId
        ? ORDER_SEED_DATA.find((o) => o.id === transaction.orderId)
        : null;

    // Build content string
    let content = transaction.reason || "";
    if (order) {
        content = `${content} Mã ĐH: #${order.code}`;
    } else if (transaction.id >= 100) {
        // For mock transactions, add order code if available
        if (transaction.orderId === 1) {
            content = `${content} Mã ĐH: #INV-9901`;
        } else if (transaction.orderId === 2) {
            content = `${content} Voucher ID: #VC-MAR-22`;
        }
    }

    const category = mapTransactionTypeToCategory(
        transaction.type,
        transaction.reason,
    );

    // Determine status (assume all are success for now, except if recent)
    const isRecent = date.getTime() > Date.now() - 24 * 60 * 60 * 1000;
    const status: "success" | "processing" = isRecent ? "processing" : "success";

    return {
        id: transaction.id.toString(),
        date: transactionDate,
        time: transactionTime,
        content,
        category,
        points: transaction.pointChange,
        status,
    };
};

// Get current partner data (assuming partner ID 1 for demo)
const currentPartnerId = 1;
const currentCustomerFranchise = CUSTOMER_FRANCHISE_SEED_DATA.find(
    (cf) => cf.id === currentPartnerId,
);
const currentCustomer = currentCustomerFranchise
    ? CUSTOMER_SEED_DATA.find((c) => c.id === currentCustomerFranchise.customerId)
    : null;

// Get all transactions for current partner from mocks
const partnerTransactions = LOYALTY_TRANSACTION_SEED_DATA.filter(
    (t) => t.customerFranchiseId === currentPartnerId && !t.isDeleted,
);

const LoyaltyPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    // Calculate statistics
    const stats = useMemo(() => {
        const totalEarned = partnerTransactions
            .filter((t) => t.pointChange > 0)
            .reduce((sum, t) => sum + t.pointChange, 0);

        const totalUsed = Math.abs(
            partnerTransactions
                .filter((t) => t.pointChange < 0)
                .reduce((sum, t) => sum + t.pointChange, 0),
        );

        const availablePoints = currentCustomerFranchise?.loyaltyPoint || 0;
        const totalAccumulated = totalEarned;

        // Calculate points expiring soon (30 days)
        const expiringSoon = 120; // Mock data

        // Calculate progress to next tier (Diamond = 20000 points)
        const nextTierPoints = 20000;
        const currentPoints = totalAccumulated;
        const progress = Math.min((currentPoints / nextTierPoints) * 100, 100);
        const pointsToNextTier = Math.max(nextTierPoints - currentPoints, 0);

        // Calculate vouchers that can be redeemed (assuming 800 points per voucher)
        const vouchersCanRedeem = Math.floor(availablePoints / 800);

        return {
            totalAccumulated,
            availablePoints,
            totalUsed,
            expiringSoon,
            progress,
            pointsToNextTier,
            vouchersCanRedeem,
        };
    }, []);

    // Map transactions to display format
    const allTransactions: TransactionDisplay[] = partnerTransactions
        .map(mapTransactionToDisplay)
        .sort(
            (a, b) =>
                new Date(`${b.date} ${b.time}`).getTime() -
                new Date(`${a.date} ${a.time}`).getTime(),
        );

    // Filter transactions based on search
    const filteredTransactions = useMemo(() => {
        return allTransactions.filter((transaction) => {
            if (
                searchQuery &&
                !transaction.content.toLowerCase().includes(searchQuery.toLowerCase())
            ) {
                return false;
            }
            return true;
        });
    }, [searchQuery, allTransactions]);

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(
        startIndex,
        startIndex + itemsPerPage,
    );

    const getCategoryBadge = (category: TransactionDisplay["category"]) => {
        const categoryConfig = {
            PURCHASE: {
                label: "MUA HÀNG",
                className: "bg-blue-500/20 text-blue-600 border-blue-500/30",
            },
            REDEEM_REWARD: {
                label: "ĐỔI THƯỞNG",
                className: "bg-purple-500/20 text-purple-600 border-purple-500/30",
            },
            REFERRAL: {
                label: "GIỚI THIỆU",
                className: "bg-orange-500/20 text-orange-600 border-orange-500/30",
            },
            SERVICE: {
                label: "DỊCH VỤ",
                className: "bg-blue-500/20 text-blue-600 border-blue-500/30",
            },
        };

        const config = categoryConfig[category];
        return (
            <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}
            >
                {config.label}
            </span>
        );
    };

    const getTierLabel = (tier: string) => {
        const tierMap: Record<string, string> = {
            Silver: "Hạng Bạc",
            Gold: "Hạng Vàng",
            Platinum: "Hạng Bạch Kim",
        };
        return tierMap[tier] || tier;
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="p-6">
                {/* Breadcrumb */}
                <nav className="mb-4 text-sm text-gray-600">
                    <span 
                        className="hover:text-primary cursor-pointer"
                        onClick={() => navigate(ROUTER_URL.HOME)}
                    >
                        Trang chủ
                    </span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-800 font-medium">Loyalty Program</span>
                </nav>

                {/* Header with Tabs */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">Điểm tích lũy</h1>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm giao dịch..."
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
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-6 border-b border-gray-200">
                        {["Điểm tích lũy", "Tổng quan", "Kho quà tặng", "Chính sách"].map(
                            (tab, index) => (
                                <button
                                    key={tab}
                                    className={`pb-4 px-2 font-medium transition-colors relative ${index === 1
                                            ? "text-primary"
                                            : "text-gray-600 hover:text-gray-900"
                                        }`}
                                >
                                    {tab}
                                    {index === 1 && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
                                    )}
                                </button>
                            ),
                        )}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Card 1: Partner Member Info */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm relative">
                        <div className="absolute top-4 right-4">
                            <Star className="text-yellow-500" size={24} />
                        </div>
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                                THÀNH VIÊN ĐỐI TÁC
                            </p>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                {getTierLabel(currentCustomerFranchise?.loyaltyTier || "Gold")}
                            </h2>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-gray-500">Tên chủ sở hữu</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {currentCustomer?.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">ID ĐỐI TÁC</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        CHOI - {currentPartnerId.toString().padStart(4, "0")} - 2024
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button 
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                            onClick={() => navigate(ROUTER_URL.CLIENT_ROUTER.PROFILE)}
                        >
                            <Gift size={16} />
                            Đổi quà ngay
                        </button>
                    </div>

                    {/* Card 2: Total Accumulated Points */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <p className="text-sm text-gray-600 mb-2">Tổng điểm tích lũy</p>
                        <p className="text-3xl font-bold text-gray-900 mb-2">
                            {stats.totalAccumulated.toLocaleString("vi-VN")}
                        </p>
                        <div className="flex items-center gap-1 mb-4">
                            <ArrowUp className="text-green-500" size={14} />
                            <span className="text-sm text-green-500">+12%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${stats.progress}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500">
                            Còn {stats.pointsToNextTier.toLocaleString("vi-VN")} điểm để lên
                            hạng Kim Cương
                        </p>
                    </div>

                    {/* Card 3: Available Points */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <p className="text-sm text-gray-600 mb-2">Điểm khả dụng</p>
                        <p className="text-3xl font-bold text-gray-900 mb-4">
                            {stats.availablePoints.toLocaleString("vi-VN")}
                        </p>
                        <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
                            Có thể đổi {stats.vouchersCanRedeem} voucher
                        </button>
                    </div>

                    {/* Card 4: Points Used */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <p className="text-sm text-gray-600 mb-2">Điểm đã sử dụng</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {stats.totalUsed.toLocaleString("vi-VN")}
                        </p>
                    </div>

                    {/* Card 5: Expiring Soon */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <p className="text-sm text-gray-600 mb-2">
                            Sắp hết hạn (30 ngày)
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                            {stats.expiringSoon.toLocaleString("vi-VN")} điểm
                        </p>
                    </div>
                </div>

                {/* Transaction History Section */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    {/* Section Header */}
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Lịch sử giao dịch điểm
                        </h2>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                                <Filter size={16} />
                                Bộ lọc
                            </button>
                        </div>
                    </div>

                    {/* Transaction Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        NGÀY GIAO DỊCH
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        NỘI DUNG
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        PHÂN LOẠI
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        SỐ ĐIỂM
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        TRẠNG THÁI
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTransactions.length > 0 ? (
                                    paginatedTransactions.map((transaction) => (
                                        <tr
                                            key={transaction.id}
                                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600">
                                                    {transaction.date} {transaction.time}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-900">
                                                    {transaction.content}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getCategoryBadge(transaction.category)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`text-sm font-semibold ${transaction.points > 0
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                        }`}
                                                >
                                                    {transaction.points > 0 ? "+" : ""}
                                                    {transaction.points.toLocaleString("vi-VN")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {transaction.status === "success" ? (
                                                        <>
                                                            <CheckCircle2 className="text-green-500" size={16} />
                                                            <span className="text-sm text-gray-600">
                                                                Thành công
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="text-orange-500" size={16} />
                                                            <span className="text-sm text-gray-600">
                                                                Đang xử lý
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            Không có giao dịch nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} của{" "}
                            {filteredTransactions.length} giao dịch
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                                &lt;
                            </button>

                            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-4 py-2 rounded-lg transition-colors text-sm ${currentPage === pageNum
                                                ? "bg-primary text-white"
                                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            {totalPages > 3 && (
                                <>
                                    <span className="px-2 text-gray-500">...</span>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}

                            <button
                                onClick={() =>
                                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                                }
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>©2024 ChoiCoffee Franchise Management System. Premium Partner Program.</p>
                </div>
            </div>
        </div>
    );
};

export default LoyaltyPage;
