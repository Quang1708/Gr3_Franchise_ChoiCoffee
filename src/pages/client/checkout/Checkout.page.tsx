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
  customerName: string;
  phone: string;
  address: string;
  items: CheckoutOrderItem[];
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
      customerName: "Khach hang",
      phone: "Dang cap nhat",
      address: "Dang cap nhat",
      items: [],
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

  return {
    customerName: toStringOrUndefined(root.customer_name) || "Khach hang",
    phone: toStringOrUndefined(root.phone) || "Dang cap nhat",
    address: toStringOrUndefined(root.address) || "Dang cap nhat",
    items,
    finalAmount: toNumberOrZero(root.final_amount ?? root.total_amount),
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
    customerName: customer?.name?.trim() || "Khach hang",
    phone: customer?.phone?.trim() || "Dang cap nhat",
    address: customer?.address?.trim() || "Dang cap nhat",
    items: [],
    finalAmount: 0,
  });
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("CARD");

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

  const handleConfirmPayment = async () => {
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

  const paymentMethodOptions: Array<{
    id: CheckoutPaymentMethod;
    label: string;
    icon: string;
    color: string;
  }> = [
    {
      id: "CARD",
      label: "Thẻ",
      icon: "credit_card",
      color: "text-blue-500",
    },
    {
      id: "CASH",
      label: "Tiền mặt",
      icon: "payments",
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
                  {resolvedOrderId || orderId}
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
                  ₫{paymentAmount.toLocaleString()}
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
                    onChange={() => setPaymentMethod(pm.id)}
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
                            So luong: {item.quantity}
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
                <span>Tổng cần thanh toán</span>
                <span className="text-charcoal tracking-tight">
                  ₫{paymentAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center pt-4">
                <span className="font-black text-charcoal uppercase text-base">
                  Tổng thanh toán
                </span>
                <span className="text-[24px] font-black text-primary tabular-nums tracking-tighter">
                  ₫{paymentAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="w-full pt-10">
              <ButtonSubmit
                label={
                  isConfirmingPayment
                    ? "Đang xác nhận..."
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

      {(isLoadingPayment || isConfirmingPayment) && <ClientLoading />}
    </div>
  );
};

export default CheckoutPage;
