import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ButtonSubmit from "@components/Client/Button/ButtonSubmit";
import ROUTER_URL from "@/routes/router.const";
import { useCustomerAuthStore } from "@/stores/customerAuth.store";
import { toastError, toastSuccess } from "@/utils/toast.util";
import ClientLoading from "@/components/Client/Client.Loading";
import { getOrdersByCustomerId } from "@/pages/client/order/service/orderApi";
import type { CheckoutPaymentMethod } from "./models/checkout.model";
import {
  confirmPaymentByPaymentId,
  getPaymentByOrderId,
} from "./usecases/checkout.usecase";

type CheckoutLocationState = {
  orderId?: string;
  orderCode?: string;
  cartId?: string;
  finalAmount?: number;
};

type CheckoutOrderOption = {
  id: string;
  name: string;
  quantity: number;
  finalPrice: number;
};

type CheckoutOrderItem = {
  id: string;
  name: string;
  imageUrl: string;
  quantity: number;
  lineTotal: number;
  options: CheckoutOrderOption[];
};

type CheckoutOrderSummary = {
  orderCode: string;
  customerName: string;
  phone: string;
  address: string;
  items: CheckoutOrderItem[];
  originalAmount: number;
  voucherDiscountAmount: number;
  promotionDiscountAmount: number;
  otherDiscountAmount: number;
  deductedAmount: number;
  finalAmount: number;
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    const withMessage = error as { message?: unknown };
    if (typeof withMessage.message === "string" && withMessage.message) {
      return withMessage.message;
    }
  }

  return "Có lỗi xảy ra khi xử lý thanh toán";
};

const asObject = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
};

const toStringOrUndefined = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
};

const toNumberOrZero = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toTimestamp = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const mapOrderSummary = (value: unknown): CheckoutOrderSummary => {
  const root = asObject(value);
  if (!root) {
    return {
      orderCode: "",
      customerName: "Khach hang",
      phone: "Dang cap nhat",
      address: "Dang cap nhat",
      items: [],
      originalAmount: 0,
      voucherDiscountAmount: 0,
      promotionDiscountAmount: 0,
      otherDiscountAmount: 0,
      deductedAmount: 0,
      finalAmount: 0,
    };
  }

  const rawItems = Array.isArray(root.order_items) ? root.order_items : [];

  const items = rawItems
    .map((rawItem: unknown, index: number) => {
      const item = asObject(rawItem);
      if (!item) return null;

      const rawOptions = Array.isArray(item.options) ? item.options : [];
      const options = rawOptions
        .map((rawOption: unknown, optionIndex: number) => {
          const option = asObject(rawOption);
          if (!option) return null;

          const optionId =
            toStringOrUndefined(
              option.id ?? option.order_item_id ?? option.product_franchise_id,
            ) || `${index}-${optionIndex}`;
          const optionName =
            toStringOrUndefined(option.product_name ?? option.name) ||
            "Tuy chon";
          const optionQuantity = toNumberOrZero(option.quantity) || 1;
          const optionPrice =
            toNumberOrZero(option.final_price ?? option.price_snapshot) || 0;

          return {
            id: optionId,
            name: optionName,
            quantity: optionQuantity,
            finalPrice: optionPrice,
          };
        })
        .filter(
          (option: CheckoutOrderOption | null): option is CheckoutOrderOption =>
            Boolean(option),
        );

      const itemId =
        toStringOrUndefined(
          item.id ?? item.order_item_id ?? item.product_franchise_id,
        ) || String(index);
      const quantity = toNumberOrZero(item.quantity) || 1;
      const lineTotal =
        toNumberOrZero(item.final_line_total ?? item.line_total) ||
        toNumberOrZero(item.price_snapshot) * quantity;

      return {
        id: itemId,
        name:
          toStringOrUndefined(item.product_name ?? item.productNameSnapshot) ||
          "San pham",
        imageUrl: toStringOrUndefined(item.product_image_url) || "",
        quantity,
        lineTotal,
        options,
      };
    })
    .filter((item: CheckoutOrderItem | null): item is CheckoutOrderItem =>
      Boolean(item),
    );

  const originalAmount = toNumberOrZero(
    root.subtotal_amount ?? root.total_amount,
  );
  const finalAmount = toNumberOrZero(root.final_amount ?? root.total_amount);
  const voucherDiscountAmount = toNumberOrZero(
    root.voucher_discount_amount ??
      root.voucher_discount ??
      root.discount_voucher_amount,
  );
  const loyaltyDiscountAmount = toNumberOrZero(
    root.loyalty_discount_amount ??
      root.points_deduction_amount ??
      root.loyalty_deduction_amount,
  );
  const promotionDiscountAmount = toNumberOrZero(
    root.promotion_discount_amount ??
      root.promo_discount_amount ??
      root.promotion_discount,
  );
  const explicitDiscountAmount = toNumberOrZero(
    root.deducted_amount ?? root.discount_amount ?? root.total_discount_amount,
  );
  const computedDiscountAmount = Math.max(0, originalAmount - finalAmount);
  const deductedAmount = Math.max(
    explicitDiscountAmount,
    computedDiscountAmount,
    voucherDiscountAmount + loyaltyDiscountAmount + promotionDiscountAmount,
  );
  const otherDiscountAmount = Math.max(
    0,
    deductedAmount -
      voucherDiscountAmount -
      loyaltyDiscountAmount -
      promotionDiscountAmount,
  );

  return {
    orderCode: toStringOrUndefined(root.code ?? root.order_code) || "",
    customerName: toStringOrUndefined(root.customer_name) || "Khach hang",
    phone: toStringOrUndefined(root.phone) || "Dang cap nhat",
    address: toStringOrUndefined(root.address) || "Dang cap nhat",
    items,
    originalAmount,
    voucherDiscountAmount,
    promotionDiscountAmount,
    otherDiscountAmount,
    deductedAmount,
    finalAmount,
  };
};

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { customerId, customer } = useCustomerAuthStore();
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [paymentCode, setPaymentCode] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [resolvedOrderId, setResolvedOrderId] = useState("");
  const [orderSummary, setOrderSummary] = useState<CheckoutOrderSummary>({
    orderCode: "",
    customerName: customer?.name?.trim() || "Khach hang",
    phone: customer?.phone?.trim() || "Dang cap nhat",
    address: customer?.address?.trim() || "Dang cap nhat",
    items: [],
    originalAmount: 0,
    voucherDiscountAmount: 0,
    promotionDiscountAmount: 0,
    otherDiscountAmount: 0,
    deductedAmount: 0,
    finalAmount: 0,
  });
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("CARD");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [isQrVisible, setIsQrVisible] = useState(false);

  // Placeholder links: replace these with real provider QR links/images later.
  const MOMO_QR_URL =
    "https://res.cloudinary.com/du261e4fa/image/upload/v1774785765/iqlbrtrwjxgtdjjapkkg.jpg";
  const VNPAY_QR_URL =
    "https://res.cloudinary.com/du261e4fa/image/upload/v1774785765/e1u7evnhzrdueqey8hoq.png";

  const checkoutState = useMemo(
    () => (location.state as CheckoutLocationState | null) || {},
    [location.state],
  );
  const orderId = useMemo(
    () => String(checkoutState.orderId || "").trim(),
    [checkoutState.orderId],
  );
  const orderCode = useMemo(
    () => String(checkoutState.orderCode || "").trim(),
    [checkoutState.orderCode],
  );
  const fallbackAmount = Number(checkoutState.finalAmount || 0);
  const displayedFinalAmount =
    paymentAmount || orderSummary.finalAmount || fallbackAmount;
  const displayedOrderCode =
    orderSummary.orderCode || orderCode || resolvedOrderId || orderId;
  const displayedOriginalAmount =
    orderSummary.originalAmount ||
    displayedFinalAmount + orderSummary.deductedAmount;
  const displayedDeductedAmount = Math.max(
    0,
    orderSummary.deductedAmount ||
      displayedOriginalAmount - displayedFinalAmount,
  );
  const displayedVoucherDiscount = Math.min(
    displayedDeductedAmount,
    orderSummary.voucherDiscountAmount,
  );  
  const displayedPromotionDiscount = Math.min(
    Math.max(
      0,
      displayedDeductedAmount -
        displayedVoucherDiscount,
    ),
    orderSummary.promotionDiscountAmount,
  );
  const displayedOtherDiscount = Math.max(
    0,
    displayedDeductedAmount -
      displayedVoucherDiscount -
      displayedPromotionDiscount,
  );

  useEffect(() => {
    if (!customerId) {
      toastError("Không tìm thấy thông tin khách hàng");
      navigate(ROUTER_URL.CLIENT_ROUTER.CART);
      return;
    }

    if (!orderId && !orderCode) {
      toastError("Không tìm thấy đơn hàng để xác nhận thanh toán");
      navigate(ROUTER_URL.CLIENT_ROUTER.CART);
      return;
    }

    void (async () => {
      try {
        const orders = await getOrdersByCustomerId(customerId);
        if (!orders.length) {
          toastError("Không tìm thấy đơn hàng của khách hàng");
          navigate(ROUTER_URL.CLIENT_ROUTER.CART);
          return;
        }

        const normalizedOrderId = orderId.toLowerCase();
        const normalizedOrderCode = orderCode.toLowerCase();

        const matchedOrder =
          orders.find(
            (item) =>
              String(item.id ?? item._id ?? "")
                .trim()
                .toLowerCase() === normalizedOrderId,
          ) ||
          orders.find(
            (item) =>
              String(item.code ?? item.order_code ?? "")
                .trim()
                .toLowerCase() === normalizedOrderId,
          ) ||
          (normalizedOrderCode
            ? orders.find(
                (item) =>
                  String(item.code ?? item.order_code ?? "")
                    .trim()
                    .toLowerCase() === normalizedOrderCode,
              )
            : undefined) ||
          [...orders].sort((a, b) => {
            const aTime = Math.max(
              toTimestamp(a.updatedAt),
              toTimestamp(a.updated_at),
              toTimestamp(a.createdAt),
              toTimestamp(a.created_at),
            );
            const bTime = Math.max(
              toTimestamp(b.updatedAt),
              toTimestamp(b.updated_at),
              toTimestamp(b.createdAt),
              toTimestamp(b.created_at),
            );
            return bTime - aTime;
          })[0];

        const matchedOrderId = String(
          matchedOrder?.id ?? matchedOrder?._id ?? "",
        ).trim();

        if (!matchedOrderId) {
          toastError("Không tìm thấy mã đơn hàng hợp lệ");
          navigate(ROUTER_URL.CLIENT_ROUTER.CART);
          return;
        }

        setResolvedOrderId(matchedOrderId);
        setOrderSummary(mapOrderSummary(matchedOrder));
      } catch (error) {
        toastError(getErrorMessage(error));
        navigate(ROUTER_URL.CLIENT_ROUTER.CART);
      }
    })();
  }, [customerId, navigate, orderCode, orderId]);

  useEffect(() => {
    if (!resolvedOrderId) return;

    void (async () => {
      setIsLoadingPayment(true);
      try {
        const { paymentId: fetchedPaymentId, paymentData } =
          await getPaymentByOrderId(resolvedOrderId);

        if (!fetchedPaymentId || !paymentData) {
          toastError("Không tìm thấy thông tin thanh toán cho đơn hàng này");
          return;
        }

        setPaymentId(fetchedPaymentId);
        setPaymentCode(
          toStringOrUndefined(paymentData.code ?? paymentData.payment_code) ||
            "",
        );
        setPaymentStatus(
          toStringOrUndefined(
            paymentData.status ?? paymentData.payment_status,
          ) || "",
        );
        setPaymentAmount(
          toNumberOrZero(paymentData.amount ?? paymentData.total_amount) ||
            orderSummary.finalAmount ||
            fallbackAmount,
        );
      } catch (error) {
        toastError(getErrorMessage(error));
      } finally {
        setIsLoadingPayment(false);
      }
    })();
  }, [fallbackAmount, orderSummary.finalAmount, resolvedOrderId]);

  const executeConfirmPayment = async () => {
    if (!paymentId) {
      toastError("Không tìm thấy mã thanh toán để xác nhận");
      return;
    }

    setIsConfirmingPayment(true);
    try {
      await confirmPaymentByPaymentId(paymentId, paymentMethod, "");
      toastSuccess("Xác nhận thanh toán thành công");
      navigate(ROUTER_URL.CLIENT_ROUTER.CLIENT_ORDER);
    } catch (error) {
      toastError(getErrorMessage(error));
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (paymentMethod === "CARD") {
      if (!cardNumber.trim() || !cardHolderName.trim()) {
        toastError("Vui lòng nhập số thẻ và tên chủ thẻ");
        return;
      }
    }

    if (paymentMethod === "MOMO" || paymentMethod === "VNPAY") {
      setIsQrVisible(true);
      return;
    }

    await executeConfirmPayment();
  };

  const qrPaymentUrl =
    paymentMethod === "MOMO"
      ? MOMO_QR_URL
      : paymentMethod === "VNPAY"
        ? VNPAY_QR_URL
        : "";

  const qrPaymentLabel = paymentMethod === "MOMO" ? "MoMo" : "VNPay";

  const paymentMethodOptions: Array<{
    id: CheckoutPaymentMethod;
    label: string;
    icon: string;
    color: string;
  }> = [
    {
      id: "COD",
      label: "COD",
      icon: "local_shipping",
      color: "text-blue-500",
    },
    {
      id: "CARD",
      label: "Thẻ",
      icon: "credit_card",
      color: "text-emerald-600",
    },
    {
      id: "MOMO",
      label: "MOMO",
      icon: "account_balance_wallet",
      color: "text-pink-600",
    },
    {
      id: "VNPAY",
      label: "VN PAY",
      icon: "qr_code_scanner",
      color: "text-indigo-600",
    },
  ];

  useEffect(() => {
    if (paymentMethod !== "MOMO" && paymentMethod !== "VNPAY") {
      setIsQrVisible(false);
    }
  }, [paymentMethod]);

  useEffect(() => {
    if (!isQrVisible) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isQrVisible]);

  return (
    <div className="pb-10 relative">
      <div className="max-w-350 mx-auto py-3 md:py-5 px-4 flex flex-col gap-4">
        <div className="flex items-center gap-1 mb-2 border-b border-slate-200">
          <button
            onClick={() => navigate(-1)}
            className="material-symbols-outlined cursor-pointer text-charcoal-400 hover:text-primary p-1"
          >
            arrow_back
          </button>
          <h1 className="text-xl font-bold uppercase tracking-tight text-charcoal-800">
            Thanh toán
          </h1>
        </div>

        <div className="bg-white border border-slate-200 rounded-md overflow-hidden border-t-4 border-t-primary">
          <div className="p-5">
            <div className="flex items-center gap-2 text-primary text-base font-medium uppercase mb-4">
              <span className="material-symbols-outlined text-xl">
                receipt_long
              </span>
              Thông tin thanh toán
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-slate-500">Mã đơn hàng</p>
                <p className="font-medium text-charcoal mt-0.5">
                  {displayedOrderCode}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-slate-500">Mã thanh toán</p>
                <p className="font-medium text-charcoal mt-0.5">
                  {paymentCode || "Đang cập nhật"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-slate-500">Số tiền</p>
                <p className="font-semibold text-primary mt-0.5">
                  ₫{displayedFinalAmount.toLocaleString()}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-slate-500">Trạng thái hiện tại</p>
                <p className="font-medium text-charcoal mt-0.5">
                  {paymentStatus || "PENDING"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-row items-center justify-between gap-6">
          <div className="flex items-center justify-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-primary text-lg">
              payments
            </span>
            <h2 className="text-base text-charcoal font-medium whitespace-nowrap">
              Phương thức thanh toán
            </h2>
          </div>

          <div className="flex flex-row gap-3 overflow-x-auto py-1 scrollbar-hide flex-1 justify-end">
            {paymentMethodOptions.map((pm) => (
              <label
                key={pm.id}
                className={`flex items-center gap-2 p-2.5 px-4 border cursor-pointer transition-all rounded-lg shrink-0 ${
                  paymentMethod === pm.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === pm.id}
                    onChange={() => {
                      setPaymentMethod(pm.id);
                      setIsQrVisible(false);
                    }}
                    className="appearance-none size-4 rounded-full border-2 border-slate-300 checked:border-primary cursor-pointer"
                  />
                  {paymentMethod === pm.id && (
                    <div className="absolute size-2 bg-primary rounded-full animate-in zoom-in duration-200"></div>
                  )}
                </div>
                <div
                  className={`size-7 rounded-full bg-slate-50 flex items-center justify-center shrink-0 ${pm.color}`}
                >
                  <span className="material-symbols-outlined text-base">
                    {pm.icon}
                  </span>
                </div>
                <span className="text-[14px] text-charcoal whitespace-nowrap">
                  {pm.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {paymentMethod === "CARD" && (
          <div className="bg-white border border-slate-200 rounded-md p-4">
            <div className="flex items-center gap-2 text-primary text-base font-medium mb-4">
              <span className="material-symbols-outlined text-xl">
                credit_card
              </span>
              Thông tin thẻ
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-600">Số thẻ</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="VD: 9704 0000 0000 0000"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Tên chủ thẻ</label>
                <input
                  type="text"
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  placeholder="VD: NGUYEN VAN A"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>            
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2 text-primary text-base font-medium uppercase mb-4">
              <span className="material-symbols-outlined text-xl">
                shopping_bag
              </span>
              Sản phẩm trong đơn
            </div>

            {orderSummary.items.length === 0 ? (
              <p className="text-sm text-slate-500">
                Chưa có sản phẩm trong đơn hàng
              </p>
            ) : (
              <div className="space-y-3">
                {orderSummary.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="size-16 rounded-md overflow-hidden bg-white border border-slate-200 shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-charcoal line-clamp-2">
                            {item.name}
                          </p>
                          <p className="text-sm text-slate-500 mt-0.5">
                            Số lượng: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-primary whitespace-nowrap">
                          ₫{item.lineTotal.toLocaleString()}
                        </p>
                      </div>

                      {item.options.length > 0 && (
                        <div className="mt-2 text-xs text-slate-600 space-y-1">
                          {item.options.map((option) => (
                            <p key={option.id}>
                              + {option.name} x{option.quantity} (₫
                              {option.finalPrice.toLocaleString()})
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary text-base font-medium uppercase">
              <span className="material-symbols-outlined text-xl">person</span>
              Thông tin nhận hàng
            </div>

            <div className="space-y-2 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-slate-500">Tên người nhận</p>
                <p className="font-medium text-charcoal mt-0.5">
                  {orderSummary.customerName}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-slate-500">Số điện thoại</p>
                <p className="font-medium text-charcoal mt-0.5">
                  {orderSummary.phone}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-slate-500">Địa chỉ nhận hàng</p>
                <p className="font-medium text-charcoal mt-0.5">
                  {orderSummary.address}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full md:max-w-sm md:ml-auto">
            <div className="space-y-3">
              <div className="flex justify-between text-base text-charcoal">
                <span>Giá tiền ban đầu</span>
                <span className="text-charcoal tracking-tight">
                  ₫{displayedOriginalAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-base text-charcoal">
                <span>Số tiền đã giảm</span>
                <span className="font-semibold text-emerald-600 tracking-tight">
                  -₫{displayedDeductedAmount.toLocaleString()}
                </span>
              </div>

              {displayedVoucherDiscount > 0 && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Giảm voucher</span>
                  <span className="text-emerald-600 tracking-tight">
                    -₫{displayedVoucherDiscount.toLocaleString()}
                  </span>
                </div>
              )}

              {displayedPromotionDiscount > 0 && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Giảm khuyến mãi</span>
                  <span className="text-emerald-600 tracking-tight">
                    -₫{displayedPromotionDiscount.toLocaleString()}
                  </span>
                </div>
              )}

              {displayedOtherDiscount > 0 && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Giảm khác</span>
                  <span className="text-emerald-600 tracking-tight">
                    -₫{displayedOtherDiscount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-4">
                <span className="font-black text-charcoal uppercase text-base">
                  Tổng thanh toán
                </span>
                <span className="text-[24px] font-black text-primary tabular-nums tracking-tighter">
                  ₫{displayedFinalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="w-full pt-10">
              <ButtonSubmit
                label={
                  isConfirmingPayment
                    ? "Đang xác nhận..."
                    : paymentMethod === "MOMO" || paymentMethod === "VNPAY"
                      ? "Xác nhận và hiển thị mã QR"
                      : "Xác nhận thanh toán"
                }
                disabled={isConfirmingPayment || isLoadingPayment || !paymentId}
                onClick={handleConfirmPayment}
              />
            </div>

            <p className="w-full text-center text-sm italic text-charcoal-400 mt-4">
              Vui lòng chọn phương thức thanh toán trước khi xác nhận
            </p>
          </div>
        </div>
      </div>

      {(paymentMethod === "MOMO" || paymentMethod === "VNPAY") &&
        isQrVisible && (
          <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[1px] flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="text-base font-semibold text-charcoal">
                  Quét mã QR thanh toán {qrPaymentLabel}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsQrVisible(false)}
                  className="cursor-pointer size-8 rounded-full hover:bg-slate-100 text-slate-500"
                  aria-label="Đóng"
                >
                  ✕
                </button>
              </div>

              <div className="px-5 pt-4 pb-5 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <img
                    src={qrPaymentUrl}
                    alt={`QR ${qrPaymentLabel}`}
                    className="w-56 h-56 object-contain mx-auto"
                  />
                </div>

                <div className="text-sm text-slate-600 space-y-1">
                  <p>1. Mở ứng dụng {qrPaymentLabel} và quét mã QR.</p>
                  <p>2. Hoàn tất chuyển khoản, sau đó bấm xác nhận.</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsQrVisible(false)}
                    className="cursor-pointer flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={executeConfirmPayment}
                    disabled={
                      isConfirmingPayment || isLoadingPayment || !paymentId
                    }
                    className="cursor-pointer flex-1 rounded-lg bg-primary text-white px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConfirmingPayment
                      ? "Đang xác nhận..."
                      : "Tôi đã thanh toán"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {(isLoadingPayment || isConfirmingPayment) && <ClientLoading />}
    </div>
  );
};

export default CheckoutPage;
