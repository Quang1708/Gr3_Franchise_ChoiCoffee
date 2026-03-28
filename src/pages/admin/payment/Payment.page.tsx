import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CRUDTable,
  type Column,
} from "@/components/Admin/template/CRUD.template";
import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import ClientLoading from "@/components/Client/Client.Loading";
import {
  confirmPaymentById,
  getPaymentByCode,
  getPaymentById,
  getPaymentByOrderId,
  getPayments,
  getPaymentsByCustomerId,
  refundPaymentById,
  type PaymentListItem,
} from "@/services/payment.service";
import {
  franchiseService,
  type FranchiseSelectItem,
} from "@/services/franchise.service";
import { getOrdersByFranchiseId } from "@/pages/admin/order/services/searchOrder.service";
import { toastError } from "@/utils/toast.util";
import { useAdminContextStore } from "@/stores/adminContext.store";
import type { Payment } from "@/models/payment.model";
import { searchCustomersUsecase } from "../customer/usecases/searchCustomers.usecase";
import type { Customer } from "@/models/customer.model";

type PaymentRow = PaymentListItem & {
  franchise: string;
  orderCode: string;
  customerDisplay: string;
  createdByName: string;
};

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const statusColor: Record<Payment["status"], string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SUCCESS: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

const statusLabel: Record<Payment["status"], string> = {
  PENDING: "Chờ xử lý",
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
  REFUNDED: "Hoàn tiền",
};

const methodLabel: Record<Payment["method"], string> = {
  CASH: "Tiền mặt",
  CARD: "Thẻ",
  MOMO: "MOMO",
  VNPAY: "VNPAY",
};

type SearchType = "id" | "code" | "orderId" | "customerId" | "customer_dropdown";

const DEMO_CUSTOMER_ID = "69a682072b4323c52ff49bc5";

const formatDateTime = (value?: string) => {
  if (!value) return "--";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
};


const PaymentPage = () => {
  const selectedFranchiseId = useAdminContextStore((s) => s.selectedFranchiseId);
  const isAdminMode = selectedFranchiseId === null;

  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>("customerId");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(true);

  const [franchises, setFranchises] = useState<FranchiseSelectItem[]>([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerForSearch, setSelectedCustomerForSearch] = useState<Customer | null>(null);

  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const franchiseNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of franchises) m.set(String(f.value), f.name);
    return m;
  }, [franchises]);

  const fetchFranchises = async () => {
    try {
      const data = await franchiseService.getAllSelect();
      setFranchises(Array.isArray(data) ? data : []);
    } catch {
      toastError("Không thể tải danh sách chi nhánh");
    }
  };

  const loadCustomersForDropdown = async () => {
    try {
      const res = await searchCustomersUsecase({
        searchCondition: {
          keyword: "",
          is_active: "",
          is_deleted: false
        },
        pageInfo: {
          pageNum: 1,
          pageSize: 100,
        }
      });
      if (res.success) {
        setCustomers(res.data || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách khách hàng:", err);
    }
  };

  const applyFranchiseScope = useCallback(
    (data: PaymentListItem[]) => {
      if (isAdminMode || selectedFranchiseId == null) return data;
      const fid = String(selectedFranchiseId);
      const filtered = data.filter((p) => String(p.franchiseId) === fid);
      if (filtered.length === 0 && data.length > 0) return data;
      return filtered;
    },
    [isAdminMode, selectedFranchiseId],
  );

  const loadAllPayments = useCallback(async () => {
    try {
      setIsLoadingList(true);
      setError(null);
      setPayments([]);

      let ordersRaw: unknown;
      try {
        ordersRaw = await getOrdersByFranchiseId(
          isAdminMode ? null : selectedFranchiseId,
        );
      } catch (orderErr) {
        const fallbackError = orderErr as Error;
        console.warn("Lỗi order API, thử fallback qua payments API:", fallbackError.message);
        try {
          const paymentData = await getPayments();
          setPayments(applyFranchiseScope(paymentData));
          return;
        } catch (fallbackGetPaymentsErr) {
          console.warn("getPayments() cũng lỗi, thử theo customer:", fallbackGetPaymentsErr);
          // Nếu getPayments không có, thử lấy qua customer list
          try {
            const customerRes = await searchCustomersUsecase({
              searchCondition: { keyword: "", is_active: "", is_deleted: false },
              pageInfo: { pageNum: 1, pageSize: 200 },
            });
            const customerList = customerRes.success ? customerRes.data || [] : [];
            const customerPayments = await Promise.all(
              customerList.map((c) => getPaymentsByCustomerId(c.id).catch(() => [])),
            );
            const merged = customerPayments.flat();
            setPayments(applyFranchiseScope(merged));
            if (merged.length > 0) return;
          } catch (ex) {
            console.warn("Lỗi load payments theo customer:", ex);
          }
          setError("Không thể tải dữ liệu thanh toán (order/paysrvice không tồn tại)");
          setPayments([]);
          return;
        }
      }

      const extractOrders = (data: unknown): Array<{ _id?: string; id?: string }> => {
        if (Array.isArray(data)) return data;
        if (!data || typeof data !== "object") return [];
        const obj = data as Record<string, unknown>;
        const candidates = [obj.data, obj.items, obj.results, obj.rows, obj.orders];
        for (const c of candidates) {
          if (Array.isArray(c)) return c;
        }
        return [];
      };

      const orders = extractOrders(ordersRaw);
      if (orders.length === 0) {
        // Nếu không có order (hoặc endpoint order không phù hợp), thử dùng payment API trực tiếp
        try {
          const paymentData = await getPayments();
          setPayments(applyFranchiseScope(paymentData));
          return;
        } catch {
          // Tiếp tục fallback customer list
          try {
            const customerRes = await searchCustomersUsecase({
              searchCondition: { keyword: "", is_active: "", is_deleted: false },
              pageInfo: { pageNum: 1, pageSize: 200 },
            });
            const customerList = customerRes.success ? customerRes.data || [] : [];
            const customerPayments = await Promise.all(
              customerList.map((c) => getPaymentsByCustomerId(c.id).catch(() => [])),
            );
            const merged = customerPayments.flat();
            setPayments(applyFranchiseScope(merged));
            return;
          } catch {
            setPayments([]);
            return;
          }
        }
      }

      const paymentPromises = orders.map((order) => {
        const orderId = order._id || order.id;
        if (!orderId) return Promise.resolve<PaymentListItem[]>([]);
        return getPaymentByOrderId(orderId).catch(() => []);
      });

      const paymentResults = await Promise.all(paymentPromises);

      const allPayments = paymentResults.flat();
      setPayments(applyFranchiseScope(allPayments));
    } catch (e) {
      const msg =
        typeof (e as { message?: string })?.message === "string"
          ? (e as { message: string }).message
          : "Không thể tải danh sách đơn hàng / thanh toán";
      setError(msg);
      toastError(msg);
      setPayments([]);
    } finally {
      setIsLoadingList(false);
    }
  }, [isAdminMode, selectedFranchiseId, applyFranchiseScope]);

  useEffect(() => {
    void fetchFranchises();
    void loadCustomersForDropdown();
  }, []);

  useEffect(() => {
    void loadAllPayments();
  }, [loadAllPayments]);

  const searchWithParams = async (type: SearchType, kwRaw: string) => {
    const kw = kwRaw.trim();
    const hasCustomerSelected = Boolean(selectedCustomerForSearch?.id);

    if (!kw && !hasCustomerSelected && !["customerId", "orderId", "code", "id"].includes(type)) {
      toastError("Vui lòng nhập từ khóa tìm kiếm hoặc chọn khách hàng");
      return;
    }

    try {
      setIsSearching(true);
      setError(null);

      const filterByType = (
        paymentsList: PaymentListItem[],
      ): PaymentListItem[] => {
        if (type === "id") {
          if (!kw) return paymentsList;
          return paymentsList.filter((p) => String(p.id) === kw);
        }
        if (type === "code") {
          if (!kw) return paymentsList;
          return paymentsList.filter((p) =>
            String(p.paymentCode ?? "").toLowerCase().includes(kw.toLowerCase()),
          );
        }
        if (type === "orderId") {
          if (!kw) return paymentsList;
          return paymentsList.filter((p) => String(p.orderId) === kw);
        }
        if (type === "customerId" || type === "customer_dropdown") {
          if (hasCustomerSelected && !kw) return paymentsList;
          if (!kw) return paymentsList;
          return paymentsList.filter((p) => String(p.customerId ?? "") === kw);
        }
        return paymentsList;
      };

      let list: PaymentListItem[] = [];

      if (hasCustomerSelected) {
        const targetCustomerId = selectedCustomerForSearch!.id;
        const customerPayments = await getPaymentsByCustomerId(targetCustomerId).catch(
          () => [],
        );

        list = filterByType(customerPayments);

        if (list.length > 0 || (!kw && ["id", "code", "orderId"].includes(type))) {
          const scoped = applyFranchiseScope(list);
          setPayments(scoped);
          return;
        }
      }

      const selectedSearch = async (): Promise<PaymentListItem[]> => {
        if ((type === "customerId" || type === "orderId" || type === "code" || type === "id") && !kw) {
          // Không nhập gì cho orderId/code/id/customerId thì load tất cả payments
          await loadAllPayments();
          return [];
        }
        if (type === "id") {
          const item = await getPaymentById(kw);
          return item && String(item.id) !== "0" ? [item] : [];
        }
        if (type === "code") {
          const item = await getPaymentByCode(kw);
          return item && String(item.id) !== "0" ? [item] : [];
        }
        if (type === "orderId") return getPaymentByOrderId(kw);
        return getPaymentsByCustomerId(kw);
      };

      list = await selectedSearch();

      if (list.length === 0) {
        const [byId, byCode, byOrder, byCustomer] = await Promise.allSettled([
          getPaymentById(kw).then((x) =>
            x && String(x.id) !== "0" ? [x] : [],
          ),
          getPaymentByCode(kw).then((x) =>
            x && String(x.id) !== "0" ? [x] : [],
          ),
          getPaymentByOrderId(kw),
          getPaymentsByCustomerId(kw),
        ]);
        const merged = new Map<string, PaymentListItem>();
        const add = (items: PaymentListItem[]) => {
          items.forEach((it) => merged.set(String(it.id), it));
        };
        if (byId.status === "fulfilled") add(byId.value);
        if (byCode.status === "fulfilled") add(byCode.value);
        if (byOrder.status === "fulfilled") add(byOrder.value);
        if (byCustomer.status === "fulfilled") add(byCustomer.value);
        list = Array.from(merged.values());
      }

      const scoped = applyFranchiseScope(list);
      setPayments(scoped);
      if (scoped.length === 0) {
        toastError(
          list.length === 0
            ? "Không tìm thấy thanh toán / không có dữ liệu từ server"
            : "Có dữ liệu nhưng không khớp chi nhánh đang chọn — thử chọn Tất cả chi nhánh hoặc đúng franchise",
        );
      }
    } catch (e) {
      const msg =
        typeof (e as { message?: string })?.message === "string"
          ? (e as { message: string }).message
          : "Không thể tìm kiếm thanh toán";
      setError(msg);
      toastError(msg);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    if (["customerId", "orderId", "code", "id"].includes(searchType) && !searchKeyword.trim()) {
      void loadAllPayments();
      return;
    }
    void searchWithParams(searchType, searchKeyword);
  };

  const prepared = useMemo<PaymentRow[]>(() => {
    return payments.map((p) => ({
      ...p,
      franchise:
        p.franchiseName ??
        franchiseNameById.get(String(p.franchiseId)) ??
        `#${p.franchiseId}`,
      orderCode: `#${p.orderId}`,
      customerDisplay:
        p.customerName ?? (p.customerId ? `#${p.customerId}` : "--"),
      createdByName: p.createdBy ? `User #${String(p.createdBy)}` : "Hệ thống",
    }));
  }, [payments, franchiseNameById]);

  const dataForTable = useMemo(() => {
    return prepared.filter((p) => {
      if (fromDate || toDate) {
        const dateStr = p.paidAt || p.createdAt;
        const dt = new Date(dateStr);
        if (Number.isNaN(dt.getTime())) return false;
        if (fromDate) {
          const f = new Date(`${fromDate}T00:00:00`);
          if (dt < f) return false;
        }
        if (toDate) {
          const t = new Date(`${toDate}T23:59:59.999`);
          if (dt > t) return false;
        }
      }
      return true;
    });
  }, [prepared, fromDate, toDate]);

  const handleView = async (item: PaymentRow) => {
    setSelectedPayment(item);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedPayment(null);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment) return;
    try {
      setIsActionLoading(true);
      const updated = await confirmPaymentById(selectedPayment.id);
      setPayments((prev) =>
        prev.map((it) => (it.id === updated.id ? updated : it)),
      );
      setSelectedPayment((prev) =>
        prev ? ({ ...prev, ...updated } as PaymentRow) : prev,
      );
    } catch (e) {
      const msg =
        typeof (e as { message?: string })?.message === "string"
          ? (e as { message: string }).message
          : "Xác nhận thanh toán thất bại";
      toastError(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRefundPayment = async () => {
    if (!selectedPayment) return;
    try {
      setIsActionLoading(true);
      const updated = await refundPaymentById(selectedPayment.id);
      setPayments((prev) =>
        prev.map((it) => (it.id === updated.id ? updated : it)),
      );
      setSelectedPayment((prev) =>
        prev ? ({ ...prev, ...updated } as PaymentRow) : prev,
      );
    } catch (e) {
      const msg =
        typeof (e as { message?: string })?.message === "string"
          ? (e as { message: string }).message
          : "Hoàn tiền thất bại";
      toastError(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns: Column<PaymentRow>[] = useMemo(
    () => [
      {
        header: "Mã đơn",
        accessor: "orderCode",
        className: "min-w-[150px]",
        sortable: true,
      },
      {
        header: "Mã thanh toán",
        accessor: "paymentCode",
        className: "min-w-[160px]",
        sortable: true,
        render: (it) => it.paymentCode ?? "--",
      },
      {
        header: "Khách hàng",
        accessor: "customerDisplay",
        className: "min-w-[160px]",
        sortable: true,
      },
      {
        header: "Chi nhánh",
        accessor: "franchise",
        className: "min-w-[200px]",
        sortable: true,
      },
      {
        header: "Phương thức",
        accessor: "method",
        render: (it) => methodLabel[it.method],
      },
      {
        header: "Số tiền",
        accessor: "amount",
        sortable: true,
        render: (it) => (
          <span className="font-semibold text-primary">
            {currency.format(it.amount)}
          </span>
        ),
      },
      {
        header: "Trạng thái",
        accessor: "status",
        sortable: true,
        render: (it) => (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColor[it.status]}`}
          >
            {statusLabel[it.status]}
          </span>
        ),
      },
      {
        header: "Ngày thanh toán",
        accessor: (it) => formatDateTime(it.paidAt || it.createdAt),
        sortable: true,
      },
      {
        header: "Người tạo",
        accessor: "createdByName",
        sortable: true,
      },
    ],
    [],
  );

  return (
    <div className="p-6 transition-all animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Quản lý thanh toán
      </h1>

      <div className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border border-gray-100 bg-white p-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Kiểu tra cứu
          </label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchType)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="customer_dropdown">Chọn từ danh sách khách hàng</option>
            <option value="orderId">Theo Order ID</option>
            <option value="customerId">Theo Customer ID</option>
            <option value="code">Theo Payment Code</option>
            <option value="id">Theo Payment ID</option>
          </select>
        </div>
        <div className="min-w-[260px] flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            {searchType === "customer_dropdown" ? "Chọn khách hàng" : "Từ khóa"}
          </label>
          {searchType === "customer_dropdown" ? (
            <select
              value={selectedCustomerForSearch?.id || ""}
              onChange={(e) => {
                const customer = customers.find((c) => c.id === e.target.value);
                setSelectedCustomerForSearch(customer || null);
                if (customer) {
                  void searchWithParams("customerId", customer.id);
                }
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">-- Chọn khách hàng --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSearch();
              }}
              placeholder={searchType === "customerId" ? "Nhập Customer ID hoặc để trống để tải tất cả" : "Nhập ID / code..."}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          )}
        </div>
        <button
          type="button"
          onClick={() => void handleSearch()}
          disabled={isSearching || searchType === "customer_dropdown" || (!searchKeyword.trim() && !["customerId", "orderId", "code", "id"].includes(searchType))}  
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {isSearching ? "Đang tìm..." : (!searchKeyword.trim() && ["customerId", "orderId", "code", "id"].includes(searchType) ? "Tải tất cả thanh toán" : "Tìm kiếm")}
        </button>
      </div>

      {isLoadingList && payments.length === 0 ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-gray-100 bg-white">
          <ClientLoading />
        </div>
      ) : (
        <CRUDTable<PaymentRow>
          title="Danh sách thanh toán"
          data={dataForTable}
          columns={columns}
          pageSize={5}
          onView={handleView}
          searchKeys={[
            "orderCode",
            "paymentCode",
            "customerDisplay",
            "franchise",
            "createdByName",
            "providerTxnId",
          ]}
          searchRight={
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Lọc từ ngày"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Lọc đến ngày"
              />
              <button
                type="button"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Xóa ngày
              </button>
              <button
                type="button"
                onClick={() => void loadAllPayments()}
                disabled={isLoadingList}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Làm mới
              </button>
            </div>
          }
          filters={[
            {
              key: "method",
              label: "Phương thức",
              options: [
                { value: "CASH", label: "Tiền mặt" },
                { value: "CARD", label: "Thẻ" },
                { value: "MOMO", label: "MOMO" },
                { value: "VNPAY", label: "VNPAY" },
              ],
            },
            {
              key: "status",
              label: "Trạng thái",
              options: [
                { value: "PENDING", label: "Chờ xử lý" },
                { value: "SUCCESS", label: "Thành công" },
                { value: "FAILED", label: "Thất bại" },
                { value: "REFUNDED", label: "Hoàn tiền" },
              ],
            },
          ]}
        />
      )}

      <CRUDModalTemplate
        isOpen={isDetailOpen && !!selectedPayment}
        onClose={handleCloseDetail}
        title="Thanh toán"
        mode="view"
        maxWidth="max-w-4xl"
      >
        {selectedPayment && (
          <div className="space-y-5">
            <div className="rounded-lg border border-gray-100 bg-white p-4">
              <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">
                Thông tin cơ bản
              </p>
              <p className="mb-2 text-sm text-gray-500">#{selectedPayment.id}</p>
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 lg:grid-cols-3">
                <p>
                  <span className="font-medium text-gray-600">Mã đơn:</span>{" "}
                  {selectedPayment.orderCode}
                </p>
                <p>
                  <span className="font-medium text-gray-600">
                    Mã thanh toán:
                  </span>{" "}
                  {selectedPayment.paymentCode ?? "--"}
                </p>
                <p>
                  <span className="font-medium text-gray-600">
                    Khách hàng:
                  </span>{" "}
                  {selectedPayment.customerDisplay}
                  {selectedPayment.customerName &&
                  selectedPayment.customerId ? (
                    <span className="ml-1 text-xs text-gray-400">
                      #{selectedPayment.customerId}
                    </span>
                  ) : null}
                </p>
                <p>
                  <span className="font-medium text-gray-600">Chi nhánh:</span>{" "}
                  {selectedPayment.franchise}
                </p>
                <p>
                  <span className="font-medium text-gray-600">
                    Phương thức:
                  </span>{" "}
                  {methodLabel[selectedPayment.method]}
                </p>
                <p>
                  <span className="font-medium text-gray-600">Số tiền:</span>{" "}
                  {currency.format(selectedPayment.amount)}
                </p>
                <p>
                  <span className="font-medium text-gray-600">Trạng thái:</span>{" "}
                  {statusLabel[selectedPayment.status]}
                </p>
                <p>
                  <span className="font-medium text-gray-600">
                    Nhà cung cấp:
                  </span>{" "}
                  {selectedPayment.providerTxnId || "--"}
                </p>
                <p>
                  <span className="font-medium text-gray-600">
                    Thanh toán lúc:
                  </span>{" "}
                  {formatDateTime(selectedPayment.paidAt)}
                </p>
                <p>
                  <span className="font-medium text-gray-600">Người tạo:</span>{" "}
                  {selectedPayment.createdByName}
                </p>
                <p>
                  <span className="font-medium text-gray-600">Ngày tạo:</span>{" "}
                  {formatDateTime(selectedPayment.createdAt)}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-white p-4">
              <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">
                Thao tác với thanh toán
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleConfirmPayment()}
                  disabled={isActionLoading}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Xác nhận thanh toán
                </button>
                <button
                  type="button"
                  onClick={() => void handleRefundPayment()}
                  disabled={isActionLoading}
                  className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  Hoàn tiền
                </button>
              </div>
            </div>
          </div>
        )}
      </CRUDModalTemplate>
    </div>
  );
};

export default PaymentPage;
