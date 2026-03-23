import { useEffect, useMemo, useState } from "react";
import {
  CRUDTable,
  type Column,
} from "@/components/Admin/template/CRUD.template";
import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import ClientLoading from "@/components/Client/Client.Loading";
import {
  getPayments,
  getRefundsByPayment,
  type PaymentListItem,
} from "@/services/payment.service";
import {
  franchiseService,
  type FranchiseSelectItem,
} from "@/services/franchise.service";
import { toastError } from "@/utils/toast.util";
import { useAdminContextStore } from "@/stores/adminContext.store";
import type { Payment } from "@/models/payment.model";
import type { Refund } from "@/models/refund.model";

type PaymentRow = PaymentListItem & {
  franchise: string;
  orderCode: string;
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

const refundStatusLabel: Record<Refund["status"], string> = {
  REQUESTED: "Đã yêu cầu",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  COMPLETED: "Hoàn tất",
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

/**
 * Trang quản lý thanh toán (admin) — mapping API.
 */
const PaymentPage = () => {
  const selectedFranchiseId = useAdminContextStore((s) => s.selectedFranchiseId);
  const isAdminMode = selectedFranchiseId === null;

  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [franchises, setFranchises] = useState<FranchiseSelectItem[]>([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(
    null,
  );
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRefundLoading, setIsRefundLoading] = useState(false);

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

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPayments();
      let list = data ?? [];
      if (!isAdminMode && selectedFranchiseId != null) {
        const fid = String(selectedFranchiseId);
        list = list.filter((p) => String(p.franchiseId) === fid);
      }
      setPayments(list);
    } catch (e) {
      const msg =
        typeof (e as { message?: string })?.message === "string"
          ? (e as { message: string }).message
          : "Không thể tải danh sách thanh toán";
      setError(msg);
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchFranchises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFranchiseId, isAdminMode]);

  const prepared = useMemo<PaymentRow[]>(() => {
    return payments.map((p) => ({
      ...p,
      franchise:
        franchiseNameById.get(String(p.franchiseId)) ?? `#${p.franchiseId}`,
      orderCode: `#${p.orderId}`,
      createdByName: p.createdBy ? `User #${p.createdBy}` : "Hệ thống",
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
    setIsRefundLoading(true);
    try {
      const r = await getRefundsByPayment(item.id);
      setRefunds(r);
    } catch {
      toastError("Không thể tải thông tin hoàn tiền");
      setRefunds([]);
    } finally {
      setIsRefundLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedPayment(null);
    setRefunds([]);
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

  if (isLoading && payments.length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center p-6">
        <ClientLoading />
      </div>
    );
  }

  return (
    <div className="p-6 transition-all animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Quản lý thanh toán
      </h1>

      {error && payments.length === 0 && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void fetchPayments()}
            className="mt-2 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200"
          >
            Thử lại
          </button>
        </div>
      )}

      <CRUDTable<PaymentRow>
        title="Danh sách thanh toán"
        data={dataForTable}
        columns={columns}
        pageSize={5}
        onView={handleView}
        searchKeys={[
          "orderCode",
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
              onClick={() => void fetchPayments()}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
                Hoàn tiền
              </p>
              {isRefundLoading ? (
                <p className="text-sm text-gray-500">Đang tải...</p>
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
                        <tr
                          key={r.id}
                          className="border-b border-gray-50 last:border-0"
                        >
                          <td className="px-2 py-2">{r.id}</td>
                          <td className="px-2 py-2">
                            {currency.format(r.amount)}
                          </td>
                          <td className="px-2 py-2">{r.reason || "--"}</td>
                          <td className="px-2 py-2">
                            {refundStatusLabel[r.status]}
                          </td>
                          <td className="px-2 py-2">
                            {formatDateTime(r.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Không có dữ liệu hoàn tiền.
                </p>
              )}
            </div>
          </div>
        )}
      </CRUDModalTemplate>
    </div>
  );
};

export default PaymentPage;
