import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar, Search } from "lucide-react";
// import ClientHeader from "../../../layouts/client/ClientHeader.layout";
// import ClientFooter from "../../../layouts/client/ClientFooter.layout";
import ROUTER_URL from "../../../routes/router.const";
import { ORDER_TABS } from "./constants";
import type { OrderListRow, OrderTab } from "./models";
import { useUserOrder } from "./hooks/userOrder";
import { OrderList } from "./components";

const OrderPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    activeTab,
    handleTabChange,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    orderCode,
    setOrderCode,
    currentPage,
    setCurrentPage,
    paginatedOrders,
    totalPages,
    isLoading,
    errorMessage,
    canSearchByCode,
    refreshOrders,
    searchByOrderCode,
  } = useUserOrder();

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (!requestedTab) return;

    const matched = ORDER_TABS.find((tab) => tab.key === requestedTab);
    if (!matched) return;

    if (activeTab !== requestedTab) {
      void handleTabChange(requestedTab as OrderTab);
    }
  }, [activeTab, handleTabChange, searchParams]);

  const openOrderDetail = (orderId: string) => {
    navigate(
      ROUTER_URL.CLIENT_ROUTER.CLIENT_ORDER_DETAIL.replace(":orderId", orderId),
    );
  };

  const handleOrderAction = (order: OrderListRow) => {
    if (order.status === "draft") {
      navigate(ROUTER_URL.CLIENT_ROUTER.CART);
      return;
    }

    if (
      order.status === "ready_for_pickup" ||
      order.status === "out_for_delivery"
    ) {
      openOrderDetail(order.id);
      return;
    }

    if (order.status === "completed" || order.status === "canceled") {
      navigate(ROUTER_URL.MENU);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      {/* Client Header */}
      {/* <ClientHeader /> */}

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 p-6 bg-background-light">
            <div className="max-w-6xl mx-auto">
              {/* Page Title */}
              <div className="mb-6">
                <h2 className="text-charcoal dark:text-white text-2xl font-black tracking-tight">
                  Danh sách Đơn hàng của tôi
                </h2>
                <p className="text-wood-brown text-sm font-normal">
                  Theo dõi và quản lý các đơn hàng nhập hàng của hệ thống
                  ChoiCoffee
                </p>
              </div>
              {/* Orders Section Frame */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 border border-gray-200">
                {/* Status Tabs */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex gap-5">
                    {ORDER_TABS.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => {
                          void handleTabChange(tab.key);
                        }}
                        className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
                          activeTab === tab.key
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
                  <div className="mt-4 flex items-center gap-3 flex-wrap pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 whitespace-nowrap">
                        Từ ngày:
                      </label>
                      <div className="relative">
                        <Calendar
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-charcoal"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 whitespace-nowrap">
                        Đến ngày:
                      </label>
                      <div className="relative">
                        <Calendar
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-charcoal"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentPage(1);
                        void refreshOrders();
                      }}
                      className="px-4 py-1.5 bg-primary text-white rounded text-xs hover:bg-primary/90 transition-colors font-medium"
                    >
                      Lọc kết quả
                    </button>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={orderCode}
                        onChange={(e) => setOrderCode(e.target.value)}
                        disabled={!canSearchByCode}
                        placeholder="Nhập mã đơn hàng"
                        className="w-44 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-charcoal disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      />
                      <button
                        onClick={() => {
                          setCurrentPage(1);
                          void searchByOrderCode();
                        }}
                        disabled={!canSearchByCode}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded text-xs hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Search size={14} />
                        Tìm mã
                      </button>
                    </div>
                  </div>

                  {errorMessage ? (
                    <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
                  ) : null}
                </div>

                <div className="p-4 md:p-5">
                  <OrderList
                    orders={paginatedOrders}
                    isLoading={isLoading}
                    onOpenOrder={openOrderDetail}
                    onActionOrder={handleOrderAction}
                    onBuyNow={() => navigate(ROUTER_URL.MENU)}
                  />
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      &lt;
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === page
                              ? "bg-primary text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Client Footer */}
      {/* <ClientFooter /> */}
    </div>
  );
};

export default OrderPage;
