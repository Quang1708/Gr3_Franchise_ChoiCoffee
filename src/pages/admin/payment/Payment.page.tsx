import { useEffect, useMemo, useState } from "react";
import { CRUDTable, type Column } from "../../../components/Admin/template/CRUD.template";
import {
  getPayments,
  getRefundsByPayment,
  type PaymentListItem,
  type RefundItem,
} from "../../../services/payment.service";
import { FRANCHISE_SEED_DATA } from "../../../mocks/franchise.seed";
import { ORDER_SEED_DATA } from "../../../mocks/order.seed";
import { USER_SEED_DATA } from "../../../mocks/user.seed";
import { toastError } from "../../../utils/toast.util";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const statusColor: Record<PaymentListItem["status"], string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SUCCESS: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

const statusLabel: Record<PaymentListItem["status"], string> = {
  PENDING: "Chờ xử lý",
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
  REFUNDED: "Hoàn tiền",
};

const methodLabel: Record<PaymentListItem["method"], string> = {
  CASH: "Tiền mặt",
  CARD: "Thẻ",
  MOMO: "MOMO",
  VNPAY: "VNPAY",
};

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
  // extend row type with display fields
  type PaymentRow = PaymentListItem & {
    franchise: string;
    orderCode: string;
    createdByName: string;
  };

  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null);
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRefundLoading, setIsRefundLoading] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPayments();
        if (!mounted) return;
        setPayments(data);
      } catch (e) {
        if (mounted) {
          setError("Không thể tải danh sách thanh toán");
          toastError("Không thể tải danh sách thanh toán");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const franchiseNameById = useMemo(
    () => new Map(FRANCHISE_SEED_DATA.map((f) => [f.id, f.name])),
    [],
  );
  const orderCodeById = useMemo(
    () => new Map(ORDER_SEED_DATA.map((o) => [o.id, o.code])),
    [],
  );
  const userNameById = useMemo(
    () => new Map(USER_SEED_DATA.map((u) => [u.id, u.name])),
    [],
  );

  const prepared = useMemo<PaymentRow[]>(() => {
    return payments.map((p) => ({
      ...p,
      franchise: franchiseNameById.get(String(p.franchiseId)) ?? `#${p.franchiseId}`,
      orderCode: orderCodeById.get(p.orderId) ?? `#${p.orderId}`,
      createdByName: p.createdBy
        ? userNameById.get(p.createdBy) ?? `User #${p.createdBy}`
        : "Hệ thống",
    }));
  }, [payments, franchiseNameById, orderCodeById, userNameById]);

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

  const handleView = async (item: any) => {
    setSelectedPayment(item);
    setIsDetailOpen(true);
    setIsRefundLoading(true);
    try {
      const r = await getRefundsByPayment(item.id);
      setRefunds(r);
    } catch {
      toastError("Không thể tải thông tin hoàn tiền");
    } finally {
      setIsRefundLoading(false);
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
        render: (it) => <span className="font-semibold text-primary">{currency.format(it.amount)}</span>,
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Payment Management</h1>

      {/* error or loading */}
      {isLoading ? (
        <div>Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <CRUDTable<PaymentRow>
          title="Danh sách thanh toán"
          data={dataForTable}
          columns={columns}
          pageSize={5}
          onView={handleView}
          searchKeys={["orderCode", "franchise", "createdByName", "providerTxnId"]}
          searchRight={
            <div className="flex items-center gap-2">
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
            </div>
          }
          filters={
            [
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
            ]
          }
        />
      )}

      {/* detail modal */}
      {isDetailOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-4xl rounded-xl border border-gray-100 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Chi tiết thanh toán</h3>
                <p className="text-sm text-gray-500">#{selectedPayment.id}</p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedPayment(null);
                  setRefunds([]);
                }}
              >
                Đóng
              </button>
            </div>
            <div className="max-h-[78vh] space-y-5 overflow-y-auto px-6 py-5">
              <div className="rounded-lg border border-gray-100 p-4">
                <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">
                  1️⃣ Thông tin cơ bản
                </p>
                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 lg:grid-cols-3">
                  <p>
                    <span className="font-medium text-gray-600">Mã đơn:</span>{" "}
                    {orderCodeById.get(selectedPayment.orderId) ?? "--"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Chi nhánh:</span>{" "}
                    {franchiseNameById.get(String(selectedPayment.franchiseId)) ?? "--"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Phương thức:</span>{" "}
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
                    <span className="font-medium text-gray-600">Nhà cung cấp:</span>{" "}
                    {selectedPayment.providerTxnId || "--"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Thanh toán lúc:</span>{" "}
                    {formatDateTime(selectedPayment.paidAt)}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Người tạo:</span>{" "}
                    {selectedPayment.createdBy
                      ? userNameById.get(selectedPayment.createdBy) ?? `User #${selectedPayment.createdBy}`
                      : "Hệ thống"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Ngày tạo:</span>{" "}
                    {formatDateTime(selectedPayment.createdAt)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 p-4">
                <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">
                  2️⃣ Hoàn tiền
                </p>
                {isRefundLoading ? (
                  <p>Đang tải...</p>
                ) : refunds.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                          <th className="px-2 py-2">ID</th>
                          <th className="px-2 py-2">Số tiền</th>
                          <th className="px-2 py-2">Lý do</th>
                          <th className="px-2 py-2">Trạng thái</th>
                          <th className="px-2 py-2">Ngày tạo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {refunds.map((r) => (
                          <tr key={r.id} className="border-b border-gray-50 last:border-0">
                            <td className="px-2 py-2">{r.id}</td>
                            <td className="px-2 py-2">{currency.format(r.amount)}</td>
                            <td className="px-2 py-2">{r.reason || "--"}</td>
                            <td className="px-2 py-2">{r.status}</td>
                            <td className="px-2 py-2">{formatDateTime(r.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Không có dữ liệu hoàn tiền.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
