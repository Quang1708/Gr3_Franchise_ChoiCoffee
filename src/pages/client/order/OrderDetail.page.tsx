import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  ShoppingBag,
  FileText,
  Headphones,
  CheckCircle2,
  Coffee,
  Truck,
  Flag,
  RotateCcw,
} from "lucide-react";
// import ClientHeader from "../../../layouts/client/ClientHeader.layout";
// import ClientFooter from "../../../layouts/client/ClientFooter.layout";
import { ORDER_SEED_DATA } from "../../../mocks/order.seed";
import { ORDER_ITEM_SEED_DATA } from "../../../mocks/order_item.seed";
import { CUSTOMER_SEED_DATA } from "../../../mocks/customer.seed";
import { ORDER_STATUS_LOG_SEED_DATA } from "../../../mocks/order_status_log.seed";
import { FRANCHISE_SEED_DATA } from "../../../mocks/franchise.seed";
import type { Order as OrderModel } from "../../../models/order.model";

// Interface for display
interface OrderDetail {
  id: string;
  orderCode: string;
  orderDate: string;
  orderTime: string;
  partnerCode: string;
  status: "confirmed" | "processing" | "delivering" | "completed";
  deliveryInfo: {
    recipient: string;
    phone: string;
    address: string;
    shippingUnit: string;
    trackingNumber: string;
    note: string;
  };
  products: Array<{
    id: string;
    name: string;
    category: string;
    package: string;
    quantity: number;
    unitPrice: number;
    total: number;
    image: string;
  }>;
  payment: {
    subtotal: number;
    shippingFee: number;
    discount: number;
    discountPercent: number;
    vat: number;
    vatPercent: number;
    total: number;
    method: string;
    bank: string;
    status: string;
  };
  timeline: {
    confirmed: { date: string; time: string };
    processing: { date: string; time: string };
    delivering: { date: string; time: string };
    completed: { date: string; time: string; estimated: boolean };
  };
}

// Helper function to map OrderModel to OrderDetail
const mapOrderDataToOrderDetail = (orderData: OrderModel): OrderDetail => {
  const date = new Date(orderData.createdAt);
  const orderDate = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const orderTime = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Get order items
  const orderItems = ORDER_ITEM_SEED_DATA.filter(
    (item) => item.orderId === orderData.id && !item.isDeleted,
  );

  // Get customer info
  const customer = CUSTOMER_SEED_DATA.find(
    (c) => c.id === orderData.customerId,
  );

  // Get franchise info
  const franchise = FRANCHISE_SEED_DATA.find(
    (f) => f.id === orderData.franchiseId,
  );

  // Get status logs for timeline
  const statusLogs = ORDER_STATUS_LOG_SEED_DATA.filter(
    (log) => log.orderId === orderData.id,
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const shippingFee = orderData.type === "ONLINE" ? 30000 : 0; // Shipping fee for online orders
  const discountPercent = 0; // No discount by default
  const discount = 0;
  const vatPercent = 10; // VAT 10%
  const vat = Math.round((subtotal * vatPercent) / 100);
  const total = orderData.totalAmount;

  // Map status
  let status: "confirmed" | "processing" | "delivering" | "completed";
  if (orderData.status === "COMPLETED") {
    status = "completed";
  } else if (orderData.status === "PREPARING") {
    status = "delivering";
  } else if (orderData.status === "CONFIRMED") {
    status = "processing";
  } else {
    status = "confirmed"; // DRAFT -> confirmed
  }

  // Build timeline from status logs
  const formatDate = (d: Date) =>
    d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  const formatTime = (d: Date) =>
    d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  const confirmedLog = statusLogs.find((log) => log.toStatus === "CONFIRMED");
  const preparingLog = statusLogs.find((log) => log.toStatus === "PREPARING");
  const completedLog = statusLogs.find((log) => log.toStatus === "COMPLETED");

  const confirmedDate = confirmedLog
    ? new Date(confirmedLog.createdAt)
    : new Date(orderData.createdAt);
  const processingDate = preparingLog
    ? new Date(preparingLog.createdAt)
    : new Date(confirmedDate.getTime() + 30 * 60 * 1000); // +30 minutes default
  const deliveringDate = preparingLog
    ? new Date(new Date(preparingLog.createdAt).getTime() + 60 * 60 * 1000) // +1 hour after preparing
    : new Date(processingDate.getTime() + 60 * 60 * 1000);
  const completedDate = completedLog
    ? new Date(completedLog.createdAt)
    : orderData.completedAt
      ? new Date(orderData.completedAt)
      : new Date(deliveringDate.getTime() + 24 * 60 * 60 * 1000); // +1 day default

  // Payment method based on order type
  const paymentMethod = orderData.type === "POS" ? "Tiền mặt" : "Chuyển khoản";
  const paymentStatus = orderData.status === "COMPLETED" ? "Đã thanh toán" : "Chưa thanh toán";

  return {
    id: orderData.id.toString(),
    orderCode: orderData.code,
    orderDate,
    orderTime,
    partnerCode: `PART-${orderData.code.slice(-3)}`,
    status,
    deliveryInfo: {
      recipient: customer?.name || "Khách hàng",
      phone: customer?.phone || "",
      address: franchise?.address || "Tại quầy",
      shippingUnit: orderData.type === "ONLINE" ? "Giao Hàng Nhanh (GHN)" : "Tại quầy",
      trackingNumber: orderData.type === "ONLINE" 
        ? `${orderData.code.slice(-6)}-GHN-99` 
        : "N/A",
      note: "Không có ghi chú",
    },
    products: orderItems.map((item) => ({
      id: item.id.toString(),
      name: item.productNameSnapshot,
      category: "Sản phẩm",
      package: "",
      quantity: item.quantity,
      unitPrice: item.priceSnapshot,
      total: item.lineTotal,
      image: `https://via.placeholder.com/60x60?text=${encodeURIComponent(item.productNameSnapshot.slice(0, 3))}`,
    })),
    payment: {
      subtotal,
      shippingFee,
      discount,
      discountPercent,
      vat,
      vatPercent,
      total,
      method: paymentMethod,
      bank: orderData.type === "ONLINE" ? "Vietcombank" : "",
      status: paymentStatus,
    },
    timeline: {
      confirmed: {
        date: formatDate(confirmedDate),
        time: formatTime(confirmedDate),
      },
      processing: {
        date: formatDate(processingDate),
        time: formatTime(processingDate),
      },
      delivering: {
        date: formatDate(deliveringDate),
        time: formatTime(deliveringDate),
      },
      completed: {
        date: formatDate(completedDate),
        time: status === "completed" ? formatTime(completedDate) : "",
        estimated: status !== "completed",
      },
    },
  };
};

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  // Find order from ORDER_SEED_DATA
  const orderData = ORDER_SEED_DATA.find(
    (order) => order.id.toString() === orderId && !order.isDeleted,
  );

  if (!orderData) {
    return (
      <div className="min-h-screen flex flex-col bg-background-light">
        {/* <ClientHeader /> */}
        <main className="flex-1 p-6 overflow-y-auto bg-background-light flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-charcoal mb-2">
              Không tìm thấy đơn hàng
            </h1>
            <p className="text-gray-600 mb-4">
              Đơn hàng với mã {orderId} không tồn tại.
            </p>
            <button
              onClick={() => navigate("/client/order")}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Quay lại danh sách đơn hàng
            </button>
          </div>
        </main>
        {/* <ClientFooter /> */}
      </div>
    );
  }

  // Map OrderData to OrderDetail
  const order = mapOrderDataToOrderDetail(orderData);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(amount)
      .replace("₫", "₫");
  };

  const getStatusLabel = (status: OrderDetail["status"]) => {
    const statusMap = {
      confirmed: "ĐÃ XÁC NHẬN",
      processing: "ĐANG XỬ LÝ",
      delivering: "ĐANG GIAO HÀNG",
      completed: "HOÀN THÀNH",
    };
    return statusMap[status];
  };

  const getStatusColor = (status: OrderDetail["status"]) => {
    const colorMap = {
      confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
      processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      delivering: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
    };
    return colorMap[status];
  };

  const totalProducts = order.products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      {/* Client Header */}
      {/* <ClientHeader /> */}

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto bg-background-light">
        {/* Breadcrumbs */}
        <nav className="mb-4 text-sm text-gray-600">
          <span
            className="hover:text-primary cursor-pointer"
            onClick={() => navigate("/")}
          >
            Trang chủ
          </span>
          <span className="mx-2">/</span>
          <span
            className="hover:text-primary cursor-pointer"
            onClick={() => navigate("/client/order")}
          >
            Đơn hàng
          </span>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium">
            Chi tiết đơn hàng #{order.orderCode}
          </span>
        </nav>

        {/* Order Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-charcoal mb-2">
              Đơn hàng #{order.orderCode}
            </h1>
            <div className="flex items-center gap-4 mb-3">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}
              >
                {getStatusLabel(order.status)}
              </span>
            </div>
            <p className="text-gray-600">
              Ngày đặt hàng: {order.orderDate} {order.orderTime} | Mã đối tác:{" "}
              {order.partnerCode}
            </p>
          </div>
        </div>

        {/* Order Progress Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
              <div
                className={`h-full transition-all ${
                  order.status === "completed"
                    ? "bg-primary w-full"
                    : order.status === "delivering"
                      ? "bg-primary w-3/4"
                      : order.status === "processing"
                        ? "bg-primary w-1/2"
                        : "bg-primary w-1/4"
                }`}
              ></div>
            </div>

            {/* Progress Steps */}
            <div className="relative flex justify-between">
              {/* Confirmed */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    [
                      "confirmed",
                      "processing",
                      "delivering",
                      "completed",
                    ].includes(order.status)
                      ? "bg-primary border-primary"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <CheckCircle2
                    size={24}
                    className={
                      [
                        "confirmed",
                        "processing",
                        "delivering",
                        "completed",
                      ].includes(order.status)
                        ? "text-white"
                        : "text-gray-400"
                    }
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Đã xác nhận
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {order.timeline.confirmed.time},{" "}
                  {order.timeline.confirmed.date}
                </p>
              </div>

              {/* Processing */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    ["processing", "delivering", "completed"].includes(
                      order.status,
                    )
                      ? "bg-primary border-primary"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Coffee
                    size={24}
                    className={
                      ["processing", "delivering", "completed"].includes(
                        order.status,
                      )
                        ? "text-white"
                        : "text-gray-400"
                    }
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Đang xử lý
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {order.timeline.processing.time},{" "}
                  {order.timeline.processing.date}
                </p>
              </div>

              {/* Delivering */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    ["delivering", "completed"].includes(order.status)
                      ? "bg-primary border-primary"
                      : order.status === "delivering"
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-300"
                  }`}
                >
                  <Truck
                    size={24}
                    className={
                      ["delivering", "completed"].includes(order.status)
                        ? "text-white"
                        : "text-gray-400"
                    }
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Đang giao hàng
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {order.timeline.delivering.time},{" "}
                  {order.timeline.delivering.date}
                </p>
              </div>

              {/* Completed */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    order.status === "completed"
                      ? "bg-primary border-primary"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Flag
                    size={24}
                    className={
                      order.status === "completed"
                        ? "text-white"
                        : "text-gray-400"
                    }
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Hoàn thành
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {order.timeline.completed.estimated ? "Dự kiến " : ""}
                  {order.timeline.completed.date}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2 cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Information Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <MapPin className="text-primary" size={20} />
                </div>
                <h2 className="text-xl font-bold text-charcoal">
                  Thông tin giao hàng
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    NGƯỜI NHẬN
                  </p>
                  <p className="text-charcoal font-medium">
                    {order.deliveryInfo.recipient}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {order.deliveryInfo.phone}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    ĐỊA CHỈ GIAO HÀNG
                  </p>
                  <p className="text-charcoal">{order.deliveryInfo.address}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    ĐƠN VỊ VẬN CHUYỂN
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-charcoal">
                      {order.deliveryInfo.shippingUnit}
                    </p>
                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                      #{order.deliveryInfo.trackingNumber}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    GHI CHÚ
                  </p>
                  <p className="text-gray-600">{order.deliveryInfo.note}</p>
                </div>
              </div>
            </div>

            {/* Products Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <ShoppingBag className="text-primary" size={20} />
                </div>
                <h2 className="text-xl font-bold text-charcoal">
                  Sản phẩm đã đặt
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                        SẢN PHẨM
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                        SỐ LƯỢNG
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                        ĐƠN GIÁ
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
                        THÀNH TIỀN
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.products.map((product) => (
                      <tr key={product.id} className="border-b border-gray-200">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-charcoal">
                                {product.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {product.category}
                              </p>
                              {product.package && (
                                <p className="text-sm text-gray-600">
                                  | {product.package}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center text-charcoal">
                          {product.quantity}
                        </td>
                        <td className="px-4 py-4 text-right text-charcoal">
                          {formatCurrency(product.unitPrice)}
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-charcoal">
                          {formatCurrency(product.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - 2 cards */}
          <div className="space-y-6">
            {/* Payment Summary Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <FileText className="text-primary" size={20} />
                </div>
                <h2 className="text-xl font-bold text-charcoal">
                  Tổng kết thanh toán
                </h2>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Tạm tính ({totalProducts} sản phẩm)
                  </span>
                  <span className="text-charcoal font-medium">
                    {formatCurrency(order.payment.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="text-charcoal font-medium">
                    {formatCurrency(order.payment.shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Chiết khấu đối tác ({order.payment.discountPercent}%)
                  </span>
                  <span className="text-red-500 font-medium">
                    -{formatCurrency(order.payment.discount)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Thuế VAT ({order.payment.vatPercent}%)
                  </span>
                  <span className="text-charcoal font-medium">
                    {formatCurrency(order.payment.vat)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-charcoal">
                    Tổng thanh toán
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(order.payment.total)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  PHƯƠNG THỨC THANH TOÁN
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <FileText className="text-primary" size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal">
                      {order.payment.method}
                    </p>
                    <p className="text-xs text-gray-600">
                      {order.payment.bank} - {order.payment.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Support Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Headphones className="text-primary" size={20} />
                </div>
                <h2 className="text-xl font-bold text-charcoal">
                  Hỗ trợ đơn hàng
                </h2>
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <Headphones className="text-primary" size={20} />
                  <span className="text-charcoal font-medium">
                    Liên hệ tổng đài hỗ trợ
                  </span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <FileText className="text-primary" size={20} />
                  <span className="text-charcoal font-medium">
                    Xem chính sách đổi trả
                  </span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <RotateCcw className="text-primary" size={20} />
                  <span className="text-charcoal font-medium">
                    Xem lịch sử thay đổi
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Client Footer */}
      {/* <ClientFooter /> */}
    </div>
  );
};

export default OrderDetailPage;
