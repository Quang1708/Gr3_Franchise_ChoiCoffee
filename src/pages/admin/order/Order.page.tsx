import { useMemo, useState } from "react";
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

const OrderPage = () => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedId, setSelectedId] = useState<string>(initialOrders[0]?.id ?? "");
  const [statusFilter, setStatusFilter] = useState<"All" | OrderStatus>("All");
  const [search, setSearch] = useState<string>("");

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchStatus = statusFilter === "All" || order.status === statusFilter;
      const matchKeyword =
        keyword.length === 0 ||
        order.id.toLowerCase().includes(keyword) ||
        order.customerName.toLowerCase().includes(keyword) ||
        order.customerPhone.replaceAll(/\s/g, "").includes(keyword.replaceAll(/\s/g, ""));
      return matchStatus && matchKeyword;
    });
  }, [orders, search, statusFilter]);

  const activeOrder = useMemo(() => {
    if (!filteredOrders.length) return null;
    return (
      filteredOrders.find((order) => order.id === selectedId) ??
      filteredOrders[0]
    );
  }, [filteredOrders, selectedId]);

  const handleStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: nextStatus } : order
      )
    );
  };

  const countByStatus = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc.total += 1;
        acc[order.status] += 1;
        return acc;
      },
      {
        total: 0,
        Pending: 0,
        Processing: 0,
        Completed: 0,
        Cancelled: 0,
      }
    );
  }, [orders]);

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
          <p className="text-gray-600">View orders, details, and update status</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-lg bg-white px-4 py-2 shadow-sm">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-semibold text-gray-800">{countByStatus.total}</p>
          </div>
          <div className="rounded-lg bg-white px-4 py-2 shadow-sm">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-lg font-semibold text-yellow-700">{countByStatus.Pending}</p>
          </div>
          <div className="rounded-lg bg-white px-4 py-2 shadow-sm">
            <p className="text-xs text-gray-500">Processing</p>
            <p className="text-lg font-semibold text-blue-700">{countByStatus.Processing}</p>
          </div>
          <div className="rounded-lg bg-white px-4 py-2 shadow-sm">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-lg font-semibold text-green-700">{countByStatus.Completed}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>
                <input
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Search order ID, customer, phone"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <select
                className="rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "All" | OrderStatus)}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <p className="text-sm text-gray-500">Showing {filteredOrders.length} orders</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr className="border-b">
                  <th className="py-3 pr-3 font-medium">Order ID</th>
                  <th className="py-3 pr-3 font-medium">Customer</th>
                  <th className="py-3 pr-3 font-medium">Created</th>
                  <th className="py-3 pr-3 font-medium">Payment</th>
                  <th className="py-3 pr-3 font-medium">Status</th>
                  <th className="py-3 pr-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const total = order.items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                  );
                  const active = order.id === activeOrder?.id;

                  return (
                    <tr
                      key={order.id}
                      className={`border-b transition hover:bg-gray-50 ${
                        active ? "bg-gray-50" : ""
                      }`}
                    >
                      <td className="py-3 pr-3">
                        <button
                          className="font-semibold text-gray-800 hover:text-primary"
                          onClick={() => setSelectedId(order.id)}
                        >
                          {order.id}
                        </button>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="font-medium text-gray-800">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.customerPhone}</p>
                      </td>
                      <td className="py-3 pr-3 text-gray-600">
                        {formatCreatedAt(order.createdAt)}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                            paymentColor[order.paymentStatus]
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                            statusColor[order.status]
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-right font-semibold text-gray-800">
                        {currency.format(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!filteredOrders.length && (
            <div className="py-10 text-center text-sm text-gray-500">
              No orders found.
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Detail</h2>
          {activeOrder ? (
            <div className="space-y-5">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="text-base font-semibold text-gray-800">{activeOrder.id}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      statusColor[activeOrder.status]
                    }`}
                  >
                    {activeOrder.status}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      paymentColor[activeOrder.paymentStatus]
                    }`}
                  >
                    {activeOrder.paymentStatus}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Customer</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{activeOrder.customerName}</p>
                  <p>{activeOrder.customerEmail}</p>
                  <p>{activeOrder.customerPhone}</p>
                  <p>{activeOrder.shippingAddress}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Payment</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Method: {activeOrder.paymentMethod}</p>
                  <p>Status: {activeOrder.paymentStatus}</p>
                  <p>Created at: {formatCreatedAt(activeOrder.createdAt)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Items</h3>
                <div className="space-y-2">
                  {activeOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-gray-700">{item.name}</p>
                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-800">
                        {currency.format(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {activeOrder.note && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Note</h3>
                  <p className="text-sm text-gray-600">{activeOrder.note}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-semibold text-gray-800">
                  {currency.format(
                    activeOrder.items.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0
                    )
                  )}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Update Status</h3>
                <select
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={activeOrder.status}
                  onChange={(event) =>
                    handleStatusChange(activeOrder.id, event.target.value as OrderStatus)
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  Status updates are saved immediately.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Select an order to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
