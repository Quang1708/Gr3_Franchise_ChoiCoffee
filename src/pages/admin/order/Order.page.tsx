import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CRUDTable,
  type Column,
} from "../../../components/Admin/template/CRUD.template";
import {
  type OrderData,
  type OrderStatus,
  type PaymentStatus,
} from "../../../mocks/dataOder.const";
import { FAKE_ORDERS } from "../../../mocks/dataOder.const";

type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: OrderData["payment_method"];
  paymentStatus: PaymentStatus;
  shippingAddress: string;
  note?: string;
  items: OrderData["items"];
};

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const statusColor: Record<OrderStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Processing: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

const paymentColor: Record<PaymentStatus, string> = {
  Unpaid: "bg-orange-100 text-orange-800",
  Paid: "bg-green-100 text-green-800",
  Refunded: "bg-gray-100 text-gray-800",
};

const initialOrders: Order[] = FAKE_ORDERS.map((order) => ({
  id: order.id,
  customerName: order.customer_name,
  customerEmail: order.customer_email,
  customerPhone: order.customer_phone,
  createdAt: order.created_at,
  status: order.status,
  paymentMethod: order.payment_method,
  paymentStatus: order.payment_status,
  shippingAddress: order.shipping_address,
  note: order.note,
  items: order.items,
}));

const formatCreatedAt = (value: string) => {
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

const calculateTotal = (order: Order) =>
  order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

const OrderPage = () => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const columns: Column<Order>[] = useMemo(
    () => [
      {
        header: "Đơn hàng",
        accessor: "id",
        sortable: true,
        className: "min-w-[230px]",
        render: (item) => (
          <div>
            <p className="font-semibold text-gray-900">{item.id}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatCreatedAt(item.createdAt)}
            </p>
          </div>
        ),
      },
      {
        header: "Khách hàng",
        accessor: "customerName",
        sortable: true,
        render: (item) => (
          <div>
            <p className="font-medium text-gray-900">{item.customerName}</p>
            <p className="text-xs text-gray-500">{item.customerPhone}</p>
          </div>
        ),
      },
      {
        header: "Thanh toán",
        accessor: "paymentStatus",
        sortable: true,
        render: (item) => (
          <div className="space-y-1">
            <p className="text-sm text-gray-700">{item.paymentMethod}</p>
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${paymentColor[item.paymentStatus]}`}
            >
              {item.paymentStatus}
            </span>
          </div>
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
            {item.status}
          </span>
        ),
      },
      {
        header: "Sản phẩm",
        accessor: "items",
        render: (item) => (
          <span className="text-sm text-gray-700">{item.items.length} món</span>
        ),
      },
      {
        header: "Tổng tiền",
        accessor: "createdAt",
        sortable: true,
        render: (item) => (
          <span className="font-semibold text-primary">
            {currency.format(calculateTotal(item))}
          </span>
        ),
      },
    ],
    [],
  );

  const handleView = (order: Order) => {
    setViewingOrder(order);
    setIsViewOpen(true);
  };

  const handleEditOpen = (order: Order) => {
    setEditingOrder(order);
    setIsEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editingOrder) return;
    setOrders((prev) =>
      prev.map((item) => (item.id === editingOrder.id ? editingOrder : item)),
    );
    toast.success("Cập nhật đơn hàng thành công");
    setIsEditOpen(false);
    setEditingOrder(null);
  };

  return (
    <div className="p-6 transition-all animate-fade-in">
      <CRUDTable<Order>
        title="Quản lý Đơn hàng"
        data={orders}
        columns={columns}
        pageSize={5}
        onView={handleView}
        onEdit={handleEditOpen}
        searchKeys={["id", "customerName", "customerPhone", "customerEmail"]}
        filters={[
          {
            key: "status",
            label: "Trạng thái",
            options: [
              { value: "Pending", label: "Pending" },
              { value: "Processing", label: "Processing" },
              { value: "Completed", label: "Completed" },
              { value: "Cancelled", label: "Cancelled" },
            ],
          },
          {
            key: "paymentStatus",
            label: "Thanh toán",
            options: [
              { value: "Unpaid", label: "Unpaid" },
              { value: "Paid", label: "Paid" },
              { value: "Refunded", label: "Refunded" },
            ],
          },
        ]}
      />

      {isViewOpen && viewingOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-3xl rounded-xl border border-gray-100 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Chi tiết đơn hàng</h3>
                <p className="text-sm text-gray-500">{viewingOrder.id}</p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                onClick={() => {
                  setIsViewOpen(false);
                  setViewingOrder(null);
                }}
              >
                Đóng
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-100 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Khách hàng</p>
                  <p className="mt-2 font-medium text-gray-900">{viewingOrder.customerName}</p>
                  <p className="text-sm text-gray-600">{viewingOrder.customerPhone}</p>
                  <p className="text-sm text-gray-600">{viewingOrder.customerEmail}</p>
                </div>
                <div className="rounded-lg border border-gray-100 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Thông tin đơn</p>
                  <p className="mt-2 text-sm text-gray-700">{formatCreatedAt(viewingOrder.createdAt)}</p>
                  <p className="text-sm text-gray-700">{viewingOrder.paymentMethod}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColor[viewingOrder.status]}`}
                    >
                      {viewingOrder.status}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${paymentColor[viewingOrder.paymentStatus]}`}
                    >
                      {viewingOrder.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Địa chỉ giao hàng</p>
                <p className="mt-2 text-sm text-gray-700">{viewingOrder.shippingAddress}</p>
              </div>

              <div className="rounded-lg border border-gray-100 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">Sản phẩm</p>
                <div className="space-y-2">
                  {viewingOrder.items.map((item, idx) => (
                    <div
                      key={`${viewingOrder.id}-${item.id}-${idx}`}
                      className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                    >
                      <p className="text-sm text-gray-700">
                        {idx + 1}. {item.name} x {item.quantity}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {currency.format(item.quantity * item.price)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                  <p className="font-medium text-gray-700">Tổng đơn</p>
                  <p className="text-lg font-semibold text-primary">
                    {currency.format(calculateTotal(viewingOrder))}
                  </p>
                </div>
              </div>

              {viewingOrder.note ? (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-yellow-700">Ghi chú</p>
                  <p className="mt-2 text-sm text-yellow-800">{viewingOrder.note}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {isEditOpen && editingOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg rounded-xl border border-gray-100 bg-white shadow-xl">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Cập nhật đơn hàng</h3>
              <p className="text-sm text-gray-500">{editingOrder.id}</p>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div>
                <label
                  htmlFor="edit-order-status"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Trạng thái đơn
                </label>
                <select
                  id="edit-order-status"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={editingOrder.status}
                  onChange={(event) =>
                    setEditingOrder((prev) =>
                      prev
                        ? {
                            ...prev,
                            status: event.target.value as OrderStatus,
                          }
                        : prev,
                    )
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-payment-status"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Trạng thái thanh toán
                </label>
                <select
                  id="edit-payment-status"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={editingOrder.paymentStatus}
                  onChange={(event) =>
                    setEditingOrder((prev) =>
                      prev
                        ? {
                            ...prev,
                            paymentStatus: event.target.value as PaymentStatus,
                          }
                        : prev,
                    )
                  }
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingOrder(null);
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                onClick={handleEditSave}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default OrderPage;
