import { useEffect, useState } from "react";
import {
  getPaymentByOrderId,
  refundPayment,
} from "@/pages/client/checkout/usecases/checkout.usecase";
import ClientLoading from "@/components/Client/Client.Loading";
import ROUTER_URL from "@/routes/router.const";
import { useCustomerAuthStore } from "@/stores/customerAuth.store";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  CircleDollarSign,
  MapPin,
  Package,
  Receipt,
  ShieldCheck,
  Store,
  Truck,
  UserRound,
  XCircle,
} from "lucide-react";
import {
  ORDER_STATUS_BADGE,
  formatCurrency,
  formatDateTime,
} from "./constants";
import type { OrderDetailView } from "./models";
import { getOrderDetailUsecase } from "./usecases";

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { customerId } = useCustomerAuthStore();

  const [orderDetail, setOrderDetail] = useState<OrderDetailView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRefundPopup, setShowRefundPopup] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [isRefunding, setIsRefunding] = useState(false);
  // Handler for refund button
  const handleShowRefundPopup = () => setShowRefundPopup(true);
  const handleCloseRefundPopup = () => {
    setShowRefundPopup(false);
    setRefundReason("");
  };
  const handleRefundReasonChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => setRefundReason(e.target.value);

  const handleRefundSubmit = async () => {
    if (!orderDetail?.id || !refundReason.trim()) return;
    setIsRefunding(true);
    try {
      // Get paymentId from orderId
      const paymentRes = await getPaymentByOrderId(orderDetail.id);
      if (!paymentRes.paymentId) throw new Error("Không tìm thấy paymentId");
      await refundPayment(paymentRes.paymentId, refundReason.trim());
      // Optionally reload order detail or show success
      handleCloseRefundPopup();
      // You may want to reload order detail here
      window.location.reload();
    } catch (err) {
      alert("Hoàn tiền thất bại: " + (err instanceof Error ? err.message : ""));
    } finally {
      setIsRefunding(false);
    }
  };

  useEffect(() => {
    const loadDetail = async () => {
      if (!customerId || !orderId) {
        setOrderDetail(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const detail = await getOrderDetailUsecase(customerId, orderId);
        setOrderDetail(detail);
      } catch (error) {
        console.error("Khong the tai chi tiet don hang:", error);
        setOrderDetail(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDetail();
  }, [customerId, orderId]);

  if (isLoading) {
    return <ClientLoading />;
  }

  if (!orderDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light p-6">
        <div className="text-center bg-white border border-gray-200 rounded-2xl px-8 py-10 shadow-sm max-w-md w-full">
          <h1 className="text-2xl font-bold text-charcoal mb-3">
            Không tìm thấy đơn hàng
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa. Vui lòng
            kiểm tra lại hoặc quay lại danh sách đơn hàng của bạn.
          </p>
          <button
            type="button"
            onClick={() => navigate(ROUTER_URL.CLIENT_ROUTER.CLIENT_ORDER)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <ArrowLeft size={16} />
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  const badge = ORDER_STATUS_BADGE[orderDetail.status];
  const { orderDate, orderTime } = formatDateTime(orderDetail.createdAt);
  const isCanceled = orderDetail.status === "canceled";
  const isDraft = orderDetail.status === "draft";
  const canceledDateTime = orderDetail.canceledAt
    ? formatDateTime(orderDetail.canceledAt)
    : null;
  const statusOrder: Array<OrderDetailView["status"]> = [
    "draft",
    "confirmed",
    "preparing",
    "ready_for_pickup",
    "out_for_delivery",
    "completed",
  ];
  const currentStepIndex = statusOrder.indexOf(orderDetail.status);

  const timelineSteps = isCanceled
    ? [
        {
          key: "draft",
          label: "Chưa hoàn tất",
          active: true,
          icon: BadgeCheck,
        },
        { key: "canceled", label: "Đã huỷ", active: true, icon: XCircle },
      ]
    : [
        {
          key: "draft",
          label: "Chưa hoàn tất",
          active: currentStepIndex >= 0,
          icon: BadgeCheck,
        },
        {
          key: "confirmed",
          label: "Đã xác nhận",
          active: currentStepIndex >= 1,
          icon: Package,
        },
        {
          key: "preparing",
          label: "Đang chuẩn bị",
          active: currentStepIndex >= 2,
          icon: Package,
        },
        {
          key: "ready_for_pickup",
          label: "Sẵn sàng lấy hàng",
          active: currentStepIndex >= 3,
          icon: Store,
        },
        {
          key: "out_for_delivery",
          label: "Đang giao hàng",
          active: currentStepIndex >= 4,
          icon: Truck,
        },
        {
          key: "completed",
          label: "Hoàn thành",
          active: currentStepIndex >= 5,
          icon: ShieldCheck,
        },
      ];
  const activeStep = timelineSteps.reduce(
    (last, step, index) => (step.active ? index : last),
    0,
  );

  return (
    <div className="min-h-screen bg-background-light pb-10">
      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigate(ROUTER_URL.CLIENT_ROUTER.CLIENT_ORDER)}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-charcoal mb-3"
              >
                <ArrowLeft size={16} />
                Quay lại danh sách đơn hàng
              </button>
              <h1 className="text-2xl md:text-3xl font-black text-charcoal">
                Đơn hàng #{orderDetail.orderCode}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Ngày đặt hàng: {orderDate} {orderTime}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${badge.className}`}
              >
                <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                {badge.label}
              </span>
            </div>
          </div>
        </section>

        {isCanceled ? (
          <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3 mb-4">
            <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Đơn hàng đã bị huỷ</p>
              <p className="text-sm text-gray-600 mt-1">
                {orderDetail.cancelReason || "Không có lý do được cung cấp"}
              </p>
              {canceledDateTime ? (
                <p className="text-sm text-gray-600 mt-1">
                  Thời gian huỷ: {canceledDateTime.orderDate} -{" "}
                  {canceledDateTime.orderTime}
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        {!isCanceled ? (
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-5">
            <div className="relative flex items-start justify-between gap-2 md:gap-4">
              {timelineSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.active;
                const isLast = index === timelineSteps.length - 1;
                const lineActive = index < activeStep;

                return (
                  <div key={step.key} className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <span
                        className={`w-8 h-8 rounded-full border-2 inline-flex items-center justify-center ${
                          isActive
                            ? "border-primary bg-primary text-white"
                            : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        <Icon size={15} />
                      </span>
                      {!isLast && (
                        <span
                          className={`h-0.5 flex-1 mx-2 ${lineActive ? "bg-primary" : "bg-gray-200"}`}
                        ></span>
                      )}
                    </div>
                    <p
                      className={`mt-2 text-xs md:text-sm font-medium ${isActive ? "text-charcoal" : "text-gray-400"}`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <article className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 md:px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <h2 className="font-semibold text-charcoal">
                  Thông tin đơn hàng
                </h2>
              </div>
              <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Khách hàng
                  </p>
                  <p className="font-semibold text-charcoal flex items-center gap-2">
                    <UserRound size={14} className="text-primary" />
                    {orderDetail.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Chi nhánh
                  </p>
                  <p className="font-semibold text-charcoal flex items-center gap-2">
                    <Store size={14} className="text-primary" />
                    {orderDetail.franchiseName}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Mã đơn hàng
                  </p>
                  <p className="font-semibold text-charcoal">
                    {orderDetail.orderCode}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Thời gian đặt hàng
                  </p>
                  <p className="font-semibold text-charcoal flex items-center gap-2">
                    <CalendarClock size={14} className="text-primary" />
                    {orderDate} - {orderTime}
                  </p>
                </div>
              </div>
            </article>

            <article className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 md:px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Package size={16} className="text-primary" />
                <h2 className="font-semibold text-charcoal">Sản phẩm đã đặt</h2>
              </div>

              {orderDetail.items.length === 0 ? (
                <p className="text-sm text-gray-500 px-4 md:px-5 py-6">
                  Không có sản phẩm trong đơn hàng.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-170 text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-500">
                        <th className="text-left px-4 md:px-5 py-3">
                          SẢN PHẨM
                        </th>
                        <th className="text-right px-4 py-3">SỐ LƯỢNG</th>
                        <th className="text-right px-4 py-3">ĐƠN GIÁ</th>
                        <th className="text-right px-4 md:px-5 py-3">
                          THÀNH TIỀN
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetail.items.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 md:px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package
                                    size={16}
                                    className="text-gray-400"
                                  />
                                )}
                              </div>
                              <p className="font-medium text-charcoal">
                                {item.name}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-charcoal">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-charcoal">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-4 md:px-5 py-3 text-right font-semibold text-charcoal">
                            {formatCurrency(item.lineTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          </div>

          <div className="space-y-4">
            <article className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Receipt size={16} className="text-primary" />
                <h2 className="font-semibold text-charcoal">
                  Tổng kết thanh toán
                </h2>
              </div>

              <div className="p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(orderDetail.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Số tiền đã giảm</span>
                  <span>
                    {formatCurrency(orderDetail.total - orderDetail.subtotal)}
                  </span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-3 mt-2 flex items-center justify-between">
                  <span className="font-semibold text-charcoal">
                    Tổng thanh toán
                  </span>
                  <span className="text-xl font-black text-primary">
                    {formatCurrency(orderDetail.total)}
                  </span>
                </div>
              </div>
            </article>

            <article className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                Thanh toán
              </p>
              <p className="text-sm font-semibold text-charcoal flex items-center gap-2">
                <CircleDollarSign size={16} className="text-primary" />
                {isDraft ? "Chưa thanh toán" : "Đã thanh toán / Đối soát"}
              </p>
              {isDraft ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate(ROUTER_URL.CLIENT_ROUTER.CHECKOUT, {
                      state: {
                        orderId: orderDetail.id,
                        orderCode: orderDetail.orderCode,
                        finalAmount: orderDetail.total,
                      },
                    })
                  }
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                >
                  Đi đến trang thanh toán
                </button>
              ) : null}
              {/* Show Cancel & Refund button if status is confirmed */}
              {!isDraft && orderDetail.status === "confirmed" && (
                <button
                  type="button"
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                  onClick={handleShowRefundPopup}
                  disabled={isRefunding}
                >
                  Hủy đơn và hoàn tiền
                </button>
              )}
              {/* Refund popup */}
              {showRefundPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-opacity-10">
                  <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                    <h2 className="text-lg font-bold mb-2 text-charcoal">
                      Hủy đơn và hoàn tiền
                    </h2>
                    <p className="mb-2 text-sm text-gray-600">
                      Vui lòng nhập lý do hoàn tiền:
                    </p>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-2 mb-4 min-h-20"
                      value={refundReason}
                      onChange={handleRefundReasonChange}
                      placeholder="Nhập lý do..."
                      disabled={isRefunding}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                        onClick={handleCloseRefundPopup}
                        disabled={isRefunding}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
                        onClick={handleRefundSubmit}
                        disabled={isRefunding || !refundReason.trim()}
                      >
                        {isRefunding ? "Đang xử lý..." : "Xác nhận hoàn tiền"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </article>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OrderDetailPage;
