import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductTable from "@components/Client/ProductTable/ProductTable";
import ButtonSubmit from "@components/Client/Button/ButtonSubmit";
import ROUTER_URL from "@/routes/router.const";
import type { OrderItem } from "@/models/order_item.model";
import type { CheckoutPaymentMethod } from "./models/checkout.model";
import { cancelCheckout, submitCheckout } from "./usecases/checkout.usecase";
import { toastError, toastSuccess } from "@/utils/toast.util";

type CheckoutLocationState = {
  products?: OrderItem[];
  subtotal?: number;
  finalAmount?: number;
  voucherCode?: string;
  voucherDiscount?: number;
  promotionDiscount?: number;
  cartId?: string;
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

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // 1. STATE THÔNG TIN NGƯỜI NHẬN
  const [isEditing, setIsEditing] = useState(false);
  const [recipient, setRecipient] = useState({
    // phone: "0911 222 333",
    // address: "97 Man Thiện, Phường Hiệp Phú, Quận 9, TP. Hồ Chí Minh",
    phone: "",
    address: "",
  });
  const [tempRecipient, setTempRecipient] = useState({ ...recipient });

  // 2. STATE VẬN CHUYỂN & THANH TOÁN
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("CARD");

  const checkoutState = useMemo(
    () => (location.state as CheckoutLocationState | null) || {},
    [location.state],
  );
  const products = useMemo(
    () => checkoutState.products || [],
    [checkoutState.products],
  );
  const subtotal = checkoutState.subtotal || 0;
  const voucherCode = checkoutState.voucherCode || "";
  const voucherDiscount = Number(checkoutState.voucherDiscount || 0);
  const promotionDiscount = Number(checkoutState.promotionDiscount || 0);
  const cartIds = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((item) => String(item.cartId || "").trim())
            .filter(Boolean),
        ),
      ),
    [products],
  );

  const discountAmount = voucherDiscount + promotionDiscount;
  const isAddressMissing = tempRecipient.address.trim().length === 0;

  const finalTotal = useMemo(() => {
    const stateFinal = Number(checkoutState.finalAmount || 0);
    if (stateFinal > 0) return stateFinal;
    return Math.max(0, subtotal - discountAmount);
  }, [checkoutState.finalAmount, subtotal, discountAmount]);

  useEffect(() => {
    if (!products || products.length === 0) {
      navigate(ROUTER_URL.CLIENT_ROUTER.CART);
    }
  }, [products, navigate]);

  const handleSaveInfo = () => {
    setRecipient({ ...tempRecipient });
    setIsEditing(false);
  };

  const handleSubmitCheckout = async () => {
    if (cartIds.length === 0) {
      toastError("Không tìm thấy giỏ hàng để thanh toán");
      return;
    }

    const address = tempRecipient.address.trim();
    const phone = tempRecipient.phone.trim();

    if (!address) {
      setIsEditing(true);
      toastError("Vui lòng nhập địa chỉ nhận hàng trước khi thanh toán");
      return;
    }

    if (!phone) {
      toastError("Vui lòng nhập số điện thoại");
      return;
    }

    setIsLoading(true);
    try {
      for (const id of cartIds) {
        await submitCheckout({
          cartId: id,
          checkout: {
            address,
            phone,
            message: "",
          },
          payment: {
            method: paymentMethod,
          },
        });
      }

      toastSuccess("Thanh toán thành công");
      navigate(`${ROUTER_URL.CLIENT_ROUTER.PAYMENT_STATUS}?success=true`);
    } catch (error) {
      toastError(getErrorMessage(error));
      navigate(`${ROUTER_URL.CLIENT_ROUTER.PAYMENT_STATUS}?success=false`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelCheckout = async () => {
    if (cartIds.length === 0) {
      navigate(ROUTER_URL.CLIENT_ROUTER.CART);
      return;
    }

    setIsCanceling(true);
    try {
      for (const id of cartIds) {
        await cancelCheckout(id);
      }
      toastSuccess("Đã hủy checkout");
      navigate(ROUTER_URL.CLIENT_ROUTER.CART);
    } catch (error) {
      toastError(getErrorMessage(error));
    } finally {
      setIsCanceling(false);
    }
  };

  if (!products) return null;

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
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-primary text-base font-medium uppercase">
                <span className="material-symbols-outlined text-xl">
                  location_on
                </span>
                Địa chỉ nhận hàng
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-primary text-[14px] hover:underline cursor-pointer"
                >
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-charcoal-400 text-[14px] hover:underline cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveInfo}
                    className="text-primary text-[14px] hover:underline cursor-pointer"
                  >
                    Lưu thông tin
                  </button>
                </div>
              )}
            </div>

            {!isEditing ? (
              <div className="flex items-baseline gap-4">
                <span className="text-charcoal font-medium shrink-0">
                  {recipient.phone}
                </span>
                <span className="text-base text-charcoal italic truncate">
                  {recipient.address}
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <label className="text-[14px] text-charcoal font-medium ml-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={tempRecipient.phone}
                    onChange={(e) =>
                      setTempRecipient({
                        ...tempRecipient,
                        phone: e.target.value,
                      })
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-base focus:border-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[14px] text-charcoal font-medium ml-1">
                    Địa chỉ chi tiết
                  </label>
                  <input
                    type="text"
                    value={tempRecipient.address}
                    onChange={(e) =>
                      setTempRecipient({
                        ...tempRecipient,
                        address: e.target.value,
                      })
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-base focus:border-primary outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white overflow-hidden">
          <ProductTable items={products} variant="checkout" />
        </div>

        {/* 2. HÌNH THỨC VẬN CHUYỂN - NGANG 1 HÀNG */}
        {/*
        <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-row items-center justify-between gap-4">
          <div className="flex flex-row items-center gap-2 flex-1 min-w-0">
            <div className="flex items-center justify-center gap-2 shrink-0">
              <span className="material-symbols-outlined text-teal-600 text-xl">
                local_shipping
              </span>
              <h2 className="text-base text-charcoal font-medium whitespace-nowrap">
                Phương thức vận chuyển:
              </h2>
            </div>

            <div className="truncate">
              <span className="text-base text-charcoal">
                {
                  SHIPPING_OPTIONS.find((opt) => opt.id === shippingMethod)
                    ?.label
                }
              </span>
              <span className="hidden md:inline-block ml-2 text-[14px] text-charcoal-400 italic">
                (Dự kiến:{" "}
                {
                  SHIPPING_OPTIONS.find((opt) => opt.id === shippingMethod)
                    ?.time
                }
                )
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <span className="text-base text-charcoal tabular-nums">
              {currentShippingPrice === 0
                ? "Miễn phí"
                : `₫${currentShippingPrice.toLocaleString()}`}
            </span>
            <button
              onClick={() => setShowShippingModal(true)}
              className=" text-primary text-[14px] hover:underline cursor-pointer border-l border-slate-200 pl-6 h-6 flex items-center"
            >
              Thay đổi
            </button>
          </div>
        </div>
        */}

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
            {[
              {
                id: "CARD",
                label: "Thẻ ATM",
                icon: "credit_card",
                color: "text-blue-500",
              },
              {
                id: "MOMO",
                label: "Ví Momo",
                icon: "account_balance_wallet",
                color: "text-[#A50064]",
              },
              {
                id: "VNPAY",
                label: "VNPAY",
                icon: "qr_code_scanner",
                color: "text-[#005BAA]",
              },
            ].map((pm) => (
              <label
                key={pm.id}
                className={`flex items-center gap-2 p-2.5 px-4 border cursor-pointer transition-all rounded-lg shrink-0
                                    ${paymentMethod === pm.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === pm.id}
                    onChange={() =>
                      setPaymentMethod(pm.id as CheckoutPaymentMethod)
                    }
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

        {/*
        <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col gap-2">
          <label className="text-sm text-charcoal font-medium">
            Mã giao dịch từ cổng thanh toán (tuỳ chọn)
          </label>
          <input
            type="text"
            value={""}
            onChange={() => {}}
            placeholder="Nhập providerTxnId nếu có"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-base focus:border-primary outline-none"
          />
        </div>
        */}

        <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-row items-center justify-between gap-6">
          <div className="flex items-center justify-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-primary text-lg">
              local_activity
            </span>
            <h2 className="text-base text-charcoal font-medium whitespace-nowrap">
              Ưu đãi của ChoiCoffee
            </h2>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-sm text-emerald-700 font-medium">
              {promotionDiscount > 0
                ? `Khuyến mãi: -₫${promotionDiscount.toLocaleString()}`
                : "Không có khuyến mãi"}
            </span>
            <span className="text-base font-medium text-primary">
              {voucherCode ? `Đã áp dụng: ${voucherCode}` : "Không có voucher"}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-8 flex flex-col items-end">
          <div className="w-full max-w-sm space-y-3">
            <div className="flex justify-between text-base text-charcoal ">
              <span>Tạm tính ({products.length} món)</span>
              <span className="text-charcoal tracking-tight">
                ₫{subtotal.toLocaleString()}
              </span>
            </div>
            {/* <div className="flex justify-between text-base text-charcoal ">
              <span>Phí giao hàng</span>

              <span className="text-teal-600 uppercase text-sm">Miễn phí</span>
            </div> */}
            <div className="border-b border-slate-100 pb-3 space-y-2">
              <div className="flex justify-between text-base text-charcoal">
                <span>Khuyến mãi</span>
                <span className="text-red-500 font-bold">
                  {promotionDiscount > 0
                    ? `-₫${promotionDiscount.toLocaleString()}`
                    : "-₫0"}
                </span>
              </div>
              <div className="flex justify-between text-base text-charcoal">
                <span>Giảm giá Voucher</span>
                <span className="text-red-500 font-bold">
                  {voucherDiscount > 0
                    ? `-₫${voucherDiscount.toLocaleString()}`
                    : "-₫0"}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="font-black text-charcoal uppercase text-base">
                Tổng thanh toán
              </span>
              <span className="text-[24px] font-black text-primary tabular-nums tracking-tighter">
                ₫{finalTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="w-full max-w-sm pt-10">
            <ButtonSubmit
              label={isLoading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
              disabled={isLoading || isCanceling || isAddressMissing}
              onClick={handleSubmitCheckout}
            />

            {isAddressMissing && (
              <p className="mt-2 text-center text-sm text-red-500">
                Vui lòng nhập địa chỉ nhận hàng để tiếp tục thanh toán
              </p>
            )}

            <button
              type="button"
              disabled={isLoading || isCanceling}
              onClick={handleCancelCheckout}
              className="mt-3 w-full border border-red-200 text-red-500 font-semibold py-2 md:py-3 rounded-xl hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCanceling ? "Đang hủy..." : "Hủy thanh toán"}
            </button>
          </div>
          <p className="w-full max-w-sm text-center text-sm italic text-charcoal-400 mt-4">
            Kiểm tra kỹ thông tin trước khi xác nhận
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
