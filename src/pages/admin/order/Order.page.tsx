import { useMemo, useState } from "react";
import {
  CRUDTable,
  type Column,
} from "../../../components/Admin/template/CRUD.template";
import { AUDIT_LOG_SEED_DATA } from "../../../mocks/audit_log.seed";
import { CUSTOMER_SEED_DATA } from "../../../mocks/customer.seed";
import { LOYALTY_TRANSACTION_SEED_DATA } from "../../../mocks/loyalty_transaction.seed";
import { FRANCHISE_SEED_DATA } from "../../../mocks/franchise.seed";
import { ORDER_ITEM_SEED_DATA } from "../../../mocks/order_item.seed";
import { ORDER_STATUS_LOG_SEED_DATA } from "../../../mocks/order_status_log.seed";
import { ORDER_SEED_DATA } from "../../../mocks/order.seed";
import { USER_SEED_DATA } from "../../../mocks/user.seed";
import type { Order as OrderModel } from "../../../models/order.model";

type OrderRow = OrderModel & {
  franchise: string;
  customer: string;
  createdByName: string;
};

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const statusColor: Record<OrderRow["status"], string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const typeColor: Record<OrderRow["type"], string> = {
  POS: "bg-indigo-100 text-indigo-800",
  ONLINE: "bg-emerald-100 text-emerald-800",
};

const statusLabel: Record<OrderRow["status"], string> = {
  DRAFT: "Nháp",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

const paymentStatusLabel: Record<"PENDING" | "PAID" | "REFUNDED", string> = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn tiền",
};

const loyaltyTypeLabel: Record<"EARN" | "REDEEM" | "ADJUST", string> = {
  EARN: "Cộng điểm",
  REDEEM: "Đổi điểm",
  ADJUST: "Điều chỉnh",
};

const getOrderItemPolicyNotice = (isLocked: boolean) => {
  if (isLocked) {
    return {
      className: "mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800",
      message:
        "Đơn hàng đã hoàn tất: không thể sửa giá, số lượng hoặc xóa món. Nếu cần xử lý, vui lòng hủy đơn hoặc tạo refund.",
    };
  }

  return {
    className: "mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800",
    message: "Đơn chưa hoàn tất: có thể điều chỉnh món trong đơn theo quy trình vận hành.",
  };
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

const paymentStatusByOrderStatus: Record<OrderRow["status"], "PENDING" | "PAID" | "REFUNDED"> = {
  DRAFT: "PENDING",
  CONFIRMED: "PENDING",
  PREPARING: "PENDING",
  COMPLETED: "PAID",
  CANCELLED: "REFUNDED",
};

const OrderPage = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const franchiseNameById = useMemo(
    () => new Map(FRANCHISE_SEED_DATA.map((franchise) => [franchise.id, franchise.name])),
    [],
  );
  const customerNameById = useMemo(
    () => new Map(CUSTOMER_SEED_DATA.map((customer) => [customer.id, customer.name])),
    [],
  );
  const userNameById = useMemo(
    () => new Map(USER_SEED_DATA.map((user) => [user.id, user.name])),
    [],
  );

  const orders = useMemo<OrderRow[]>(() => {
    return ORDER_SEED_DATA.filter((order) => !order.isDeleted).map((order) => ({
      ...order,
      franchise:
        franchiseNameById.get(order.franchiseId) ?? `Franchise #${order.franchiseId}`,
      customer: customerNameById.get(order.customerId) ?? `Customer #${order.customerId}`,
      createdByName: order.createdBy
        ? (userNameById.get(order.createdBy) ?? `User #${order.createdBy}`)
        : "Online/Hệ thống",
    }));
  }, [franchiseNameById, customerNameById, userNameById]);

  const filteredOrders = useMemo(() => {
    if (!fromDate && !toDate) return orders;

    const fromDateObj = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const toDateObj = toDate ? new Date(`${toDate}T23:59:59.999`) : null;

    return orders.filter((order) => {
      const createdAt = new Date(order.createdAt);
      if (Number.isNaN(createdAt.getTime())) return false;
      if (fromDateObj && createdAt < fromDateObj) return false;
      if (toDateObj && createdAt > toDateObj) return false;
      return true;
    });
  }, [orders, fromDate, toDate]);

  const selectedOrderDetail = useMemo(() => {
    if (!selectedOrder) return null;

    const orderItems = ORDER_ITEM_SEED_DATA.filter(
      (item) => item.orderId === selectedOrder.id && !item.isDeleted,
    );

    const orderStatusLogs = ORDER_STATUS_LOG_SEED_DATA.filter(
      (log) => log.orderId === selectedOrder.id,
    ).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    const loyaltyLogs = LOYALTY_TRANSACTION_SEED_DATA.filter(
      (log) => log.orderId === selectedOrder.id && !log.isDeleted,
    ).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    const orderItemIds = new Set(orderItems.map((item) => item.id));
    const auditLogs = AUDIT_LOG_SEED_DATA.filter(
      (log) =>
        (log.entityType === "order" && log.entityId === selectedOrder.id) ||
        (log.entityType === "order_item" && orderItemIds.has(log.entityId)),
    ).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    const timeline = [
      {
        label: "Tạo đơn",
        value: selectedOrder.createdAt,
      },
      {
        label: "Xác nhận",
        value: selectedOrder.confirmedAt,
      },
      {
        label: "Hoàn tất",
        value: selectedOrder.completedAt,
      },
    ];

    const payment = {
      method: selectedOrder.type === "POS" ? "Tiền mặt" : "Cổng thanh toán online",
      amount: selectedOrder.totalAmount,
      status: paymentStatusByOrderStatus[selectedOrder.status],
      providerTxnId:
        selectedOrder.type === "ONLINE"
          ? `TXN-${selectedOrder.code}`
          : "Không áp dụng",
    };

    const pointTotal = loyaltyLogs.reduce((sum, log) => sum + log.pointChange, 0);

    return {
      orderItems,
      orderStatusLogs,
      loyaltyLogs,
      auditLogs,
      timeline,
      payment,
      pointTotal,
    };
  }, [selectedOrder]);

  const handleView = (order: OrderRow) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const isOrderItemLocked = selectedOrder?.status === "COMPLETED";
  const orderItemPolicyNotice = getOrderItemPolicyNotice(isOrderItemLocked);

  const columns: Column<OrderRow>[] = useMemo(
    () => [
      {
        header: "Mã đơn",
        accessor: "code",
        sortable: true,
        className: "min-w-[170px]",
      },
      {
        header: "Chi nhánh",
        accessor: "franchise",
        sortable: true,
        className: "min-w-[200px]",
      },
      {
        header: "Khách hàng",
        accessor: "customer",
        sortable: true,
        className: "min-w-[200px]",
      },
      {
        header: "Loại đơn",
        accessor: "type",
        sortable: true,
        render: (item) => (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${typeColor[item.type]}`}
          >
            {item.type}
          </span>
        ),
      },
      {
        header: "Trạng thái",
        accessor: "status",
        sortable: true,
        render: (item) => (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColor[item.status]}`}
          >
            {statusLabel[item.status]}
          </span>
        ),
      },
      {
        header: "Tổng tiền",
        accessor: "totalAmount",
        sortable: true,
        render: (item) => (
          <span className="font-semibold text-primary">
            {currency.format(item.totalAmount)}
          </span>
        ),
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
      <CRUDTable<OrderRow>
        title="Danh sách đơn hàng"
        data={filteredOrders}
        columns={columns}
        pageSize={5}
        onView={handleView}
        searchKeys={["code", "franchise", "customer", "createdByName"]}
        searchRight={
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Lọc từ ngày"
            />
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
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
        filters={[
          {
            key: "type",
            label: "Loại đơn",
            options: [
              { value: "POS", label: "POS" },
              { value: "ONLINE", label: "ONLINE" },
            ],
          },
          {
            key: "status",
            label: "Trạng thái",
            options: [
              { value: "DRAFT", label: "Nháp" },
              { value: "CONFIRMED", label: "Đã xác nhận" },
              { value: "PREPARING", label: "Đang chuẩn bị" },
              { value: "COMPLETED", label: "Hoàn tất" },
              { value: "CANCELLED", label: "Đã hủy" },
            ],
          },
        ]}
      />

      {isDetailOpen && selectedOrder && selectedOrderDetail ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-6xl rounded-xl border border-gray-100 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Chi tiết đơn hàng</h3>
                <p className="text-sm text-gray-500">{selectedOrder.code}</p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedOrder(null);
                }}
              >
                Đóng
              </button>
            </div>

            <div className="max-h-[78vh] space-y-5 overflow-y-auto px-6 py-5">
              <div className="rounded-lg border border-gray-100 p-4">
                <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">1️⃣ Thông tin chung</p>
                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 lg:grid-cols-3">
                  <p><span className="font-medium text-gray-600">Mã đơn:</span> {selectedOrder.code}</p>
                  <p><span className="font-medium text-gray-600">Chi nhánh:</span> {selectedOrder.franchise}</p>
                  <p><span className="font-medium text-gray-600">Khách hàng:</span> {selectedOrder.customer}</p>
                  <p><span className="font-medium text-gray-600">Loại đơn:</span> {selectedOrder.type}</p>
                  <p>
                    <span className="font-medium text-gray-600">Tổng tiền :</span>{" "}
                    {currency.format(selectedOrder.totalAmount)}
                  </p>
                  <p><span className="font-medium text-gray-600">Nhân viên tạo đơn:</span> {selectedOrder.createdByName}</p>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">Thời gian trạng thái</p>
                  <div className="space-y-2">
                    {selectedOrderDetail.timeline.map((timelineItem) => (
                      <div
                        key={`${selectedOrder.id}-${timelineItem.label}`}
                        className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                      >
                        <span className="text-sm text-gray-700">{timelineItem.label}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDateTime(timelineItem.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 p-4">
                <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">2️⃣ Món trong đơn</p>
                <div className={orderItemPolicyNotice.className}>{orderItemPolicyNotice.message}</div>
                {selectedOrderDetail.orderItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                          <th className="px-2 py-2">Tên món </th>
                          <th className="px-2 py-2 text-right">giá tiền</th>
                          <th className="px-2 py-2 text-right">Số lượng</th>
                          <th className="px-2 py-2 text-right"> tổng tiền </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrderDetail.orderItems.map((item) => (
                          <tr key={item.id} className="border-b border-gray-50 last:border-0">
                            <td className="px-2 py-2 text-gray-800">{item.productNameSnapshot}</td>
                            <td className="px-2 py-2 text-right text-gray-700">
                              {currency.format(item.priceSnapshot)}
                            </td>
                            <td className="px-2 py-2 text-right text-gray-700">{item.quantity}</td>
                            <td className="px-2 py-2 text-right font-medium text-gray-900">
                              {currency.format(item.lineTotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Không có món trong đơn.</p>
                )}
              </div>

              <div className="rounded-lg border border-gray-100 p-4">
                <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">3️⃣ Thanh toán</p>
                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                  <p><span className="font-medium text-gray-600">Phương thức:</span> {selectedOrderDetail.payment.method}</p>
                  <p>
                    <span className="font-medium text-gray-600">Số tiền:</span>{" "}
                    {currency.format(selectedOrderDetail.payment.amount)}
                  </p>
                  <p><span className="font-medium text-gray-600">Trạng thái:</span> {paymentStatusLabel[selectedOrderDetail.payment.status]}</p>
                  <p>
                    <span className="font-medium text-gray-600">Nhà Cung Cấp :</span>{" "}
                    {selectedOrderDetail.payment.providerTxnId}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 p-4">
                <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">4️⃣ Điểm tích lũy</p>
                <p className="mb-3 text-sm">
                  <span className="font-medium text-gray-600">Điểm cộng / trừ:</span>{" "}
                  <span
                    className={selectedOrderDetail.pointTotal >= 0 ? "text-green-700" : "text-red-700"}
                  >
                    {selectedOrderDetail.pointTotal >= 0
                      ? `+${selectedOrderDetail.pointTotal}`
                      : selectedOrderDetail.pointTotal}
                  </span>
                </p>
                <p className="mb-2 text-sm font-medium text-gray-700">Nhật ký điểm tích lũy</p>
                {selectedOrderDetail.loyaltyLogs.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrderDetail.loyaltyLogs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-lg border border-gray-100 px-3 py-2 text-sm"
                      >
                        <p className="font-medium text-gray-800">
                          {loyaltyTypeLabel[log.type]} • {log.pointChange > 0 ? `+${log.pointChange}` : log.pointChange} điểm
                        </p>
                        <p className="text-gray-600">{log.reason ?? "Không có lý do"}</p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(log.createdAt)} • bởi {userNameById.get(log.createdBy) ?? `User #${log.createdBy}`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Không có log giao dịch loyalty cho đơn này.</p>
                )}
              </div>

              <div className="rounded-lg border border-gray-100 p-4">
                <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">5️⃣ Nhật ký hoạt động </p>

                <p className="mb-2 text-sm font-medium text-gray-700">Nhật ký hoạt động trạng thái đơn hàng </p>
                {selectedOrderDetail.orderStatusLogs.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrderDetail.orderStatusLogs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-lg border border-gray-100 px-3 py-2 text-sm"
                      >
                        <p className="font-medium text-gray-800">
                          {log.fromStatus} → {log.toStatus}
                        </p>
                        <p className="text-gray-600">{log.note ?? "Không có ghi chú"}</p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(log.createdAt)} • bởi {userNameById.get(log.changedBy) ?? `User #${log.changedBy}`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mb-3 text-sm text-gray-500">Không có order_status_log.</p>
                )}

                <p className="mb-2 mt-4 text-sm font-medium text-gray-700">Nhật ký hoạt động khác </p>
                {selectedOrderDetail.auditLogs.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrderDetail.auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-lg border border-gray-100 px-3 py-2 text-sm"
                      >
                        <p className="font-medium text-gray-800">
                          {log.entityType}#{log.entityId} • {log.action}
                        </p>
                        <p className="text-gray-600">{log.note ?? "Không có ghi chú"}</p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(log.createdAt)} • bởi {userNameById.get(log.changedBy) ?? `User #${log.changedBy}`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Không có audit_log liên quan tới đơn này.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default OrderPage;
