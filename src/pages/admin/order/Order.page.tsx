import React, { useMemo, useState } from "react";
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

  const handleStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: nextStatus } : order
      )
    );
  };

  const handlePaymentStatusChange = (orderId: string, nextStatus: PaymentStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, paymentStatus: nextStatus } : order
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

      <div className="grid grid-cols-1 gap-6">
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
              <thead className="text-gray-500 bg-gray-50 sticky top-0">
                <tr className="border-b">
                  <th className="py-4 px-4 font-medium">Order ID</th>
                  <th className="py-4 px-4 font-medium">Customer</th>
                  <th className="py-4 px-4 font-medium">Created</th>
                  <th className="py-4 px-4 font-medium">Payment</th>
                  <th className="py-4 px-4 font-medium">Status</th>
                  <th className="py-4 px-4 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const total = order.items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                  );
                  const isExpanded = order.id === expandedId;

                  return (
                    <React.Fragment key={order.id}>
                      <tr
                        className={`border-b transition cursor-pointer ${
                          isExpanded ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400 font-bold w-4">{isExpanded ? "▼" : "▶"}</span>
                            <span className="font-semibold text-gray-800">{order.id}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-800">{order.customerName}</p>
                          <p className="text-xs text-gray-500">{order.customerPhone}</p>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {formatCreatedAt(order.createdAt)}
                        </td>
                        <td className="py-4 px-4">
                          <select
                            className="rounded-lg border border-gray-200 bg-white py-1.5 px-2 text-xs font-medium text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            value={order.paymentStatus}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(event) => {
                              event.stopPropagation();
                              handlePaymentStatusChange(order.id, event.target.value as PaymentStatus);
                            }}
                          >
                            <option value="Unpaid">Unpaid</option>
                            <option value="Paid">Paid</option>
                            <option value="Refunded">Refunded</option>
                          </select>
                        </td>
                        <td className="py-4 px-4">
                          <select
                            className="rounded-lg border border-gray-200 bg-white py-1.5 px-2 text-xs font-medium text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            value={order.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(event) => {
                              event.stopPropagation();
                              handleStatusChange(order.id, event.target.value as OrderStatus);
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-gray-800">
                          {currency.format(total)}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-blue-50 border-b">
                          <td colSpan={6} className="p-8">
                            <div className="max-w-6xl mx-auto">
                              <div className="grid grid-cols-2 gap-8 mb-8">
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">person</span>
                                    Customer Information
                                  </h4>
                                  <div className="text-sm space-y-3">
                                    <div>
                                      <p className="text-gray-500 text-xs font-medium uppercase">Name</p>
                                      <p className="text-gray-800 font-medium">{order.customerName}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 text-xs font-medium uppercase">Email</p>
                                      <p className="text-gray-800">{order.customerEmail}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 text-xs font-medium uppercase">Phone</p>
                                      <p className="text-gray-800">{order.customerPhone}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 text-xs font-medium uppercase">Address</p>
                                      <p className="text-gray-800">{order.shippingAddress}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">receipt_long</span>
                                    Order Information
                                  </h4>
                                  <div className="text-sm space-y-3">
                                    <div>
                                      <p className="text-gray-500 text-xs font-medium uppercase">Created</p>
                                      <p className="text-gray-800">{formatCreatedAt(order.createdAt)}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 text-xs font-medium uppercase">Payment Method</p>
                                      <p className="text-gray-800">{order.paymentMethod}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 text-xs font-medium uppercase">Order Status</p>
                                      <p className={`inline-block rounded px-2 py-1 text-xs font-medium mt-1 ${statusColor[order.status]}`}>
                                        {order.status}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 text-xs font-medium uppercase">Payment Status</p>
                                      <p className={`inline-block rounded px-2 py-1 text-xs font-medium mt-1 ${paymentColor[order.paymentStatus]}`}>
                                        {order.paymentStatus}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <span className="material-symbols-outlined text-lg">shopping_cart</span>
                                  Items ({order.items.length})
                                </h4>
                                <div className="space-y-2">
                                  {order.items.map((item, idx) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-100 rounded hover:bg-gray-50 transition">
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-800">{idx + 1}. {item.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">Quantity: {item.quantity} x {currency.format(item.price)}</p>
                                      </div>
                                      <p className="font-bold text-gray-800 ml-4">
                                        {currency.format(item.price * item.quantity)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {order.note && (
                                <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6 mb-8">
                                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">note</span>
                                    Note
                                  </h4>
                                  <p className="text-sm text-gray-700">{order.note}</p>
                                </div>
                              )}

                              <div className="bg-gradient-to-r from-primary to-blue-600 rounded-lg p-6 text-white">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium opacity-90">Total Amount</p>
                                    <p className="text-3xl font-bold mt-1">{currency.format(total)}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm opacity-90">Order ID: {order.id}</p>
                                    <p className="text-sm opacity-90 mt-1">Items: {order.items.length}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
      </div>
    </div>
  );
};

export default OrderPage;
