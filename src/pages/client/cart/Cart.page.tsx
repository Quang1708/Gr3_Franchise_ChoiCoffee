import React from "react";
import { useNavigate } from "react-router-dom";
import ProductTable from "@components/Client/ProductTable/ProductTable";
import ROUTER_URL from "@/routes/router.const";
import ClientLoading from "@/components/Client/Client.Loading";
import { checkoutCart } from "@/components/cart/usecase/checkoutCart.usecase";
import { useCustomerAuthStore } from "@/stores/customerAuth.store";
import { toastError } from "@/utils/toast.util";
import CartDeleteModal from "./components/CartDeleteModal";
import CartEmptyState from "./components/CartEmptyState";
import CartHeader from "./components/CartHeader";
import CartStickyCheckout from "./components/CartStickyCheckout";
import CartVoucherModal from "./components/CartVoucherModal";
import { useCartPageState } from "./hooks/useCartPageState";

const normalizeProfileField = (value?: string) => {
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  if (!normalized) return "";

  const lower = normalized.toLowerCase();
  if (lower === "null" || lower === "undefined") {
    return "";
  }

  return normalized;
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    const err = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
      message?: string;
    };

    if (err.response?.data?.message) {
      return err.response.data.message;
    }

    if (err.message) {
      return err.message;
    }
  }

  return "Có lỗi xảy ra khi tạo đơn hàng";
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

const pickOrderId = (value: unknown): string | undefined => {
  const root = asObject(value);
  if (!root) return undefined;

  const directKeys = ["orderId", "order_id"] as const;
  const nestedKeys = ["orderId", "order_id", "id", "_id"] as const;

  for (const key of directKeys) {
    const maybe = toStringOrUndefined(root[key]);
    if (maybe) return maybe;
  }

  const candidates = [root.data, root.order, root.result, root.checkout];
  for (const candidate of candidates) {
    const obj = asObject(candidate);
    if (!obj) continue;

    const nestedOrder = asObject(obj.order);
    const nestedCandidates = nestedOrder ? [nestedOrder, obj] : [obj];

    for (const target of nestedCandidates) {
      for (const key of nestedKeys) {
        const maybe = toStringOrUndefined(target[key]);
        if (maybe) return maybe;
      }
    }
  }

  return undefined;
};

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const customer = useCustomerAuthStore((state) => state.customer);
  const displayName = customer?.name?.trim() || "Khách hàng";
  const [recipient, setRecipient] = React.useState({
    phone: normalizeProfileField(customer?.phone),
    address: normalizeProfileField(customer?.address),
  });
  const [checkingOutCartId, setCheckingOutCartId] = React.useState("");
  const {
    franchiseName,
    franchiseImageUrl,
    cartPricingMap,
    voucherOptions,
    voucherContext,
    selectedVoucher,
    isLoadingCart,
    isLoadingVouchers,
    isApplyingVoucher,
    isMutatingCart,
    orderItems,
    showVoucherModal,
    showDeleteModal,
    productToDelete,
    franchiseToDelete,
    setShowVoucherModal,
    closeDeleteModal,
    setSelectedVoucher,
    openVoucherModal,
    handleApplyVoucher,
    handleRemoveVoucher,
    updateQuantity,
    openDeleteSingleModal,
    handleConfirmDeleteSingle,
    handleConfirmDeleteMultiple,
  } = useCartPageState();

  React.useEffect(() => {
    if (!customer) return;

    setRecipient((prev) => ({
      phone: prev.phone || normalizeProfileField(customer.phone),
      address: prev.address || normalizeProfileField(customer.address),
    }));
  }, [customer]);

  const groupedByCart = React.useMemo(() => {
    const groups = new Map<
      string,
      {
        groupId: string;
        cartId: string;
        franchiseName: string;
        franchiseImageUrl: string;
        franchiseId: string;
        subtotalAmount: number;
        promotionDiscount: number;
        voucherDiscount: number;
        finalAmount: number;
        voucherCode: string;
        items: typeof orderItems;
      }
    >();

    orderItems.forEach((item) => {
      const key =
        String(item.cartId || "").trim() ||
        item.franchiseId ||
        item.franchiseName ||
        franchiseName ||
        "default";

      if (!groups.has(key)) {
        const pricing = item.cartId ? cartPricingMap[item.cartId] : undefined;
        groups.set(key, {
          groupId: key,
          cartId: item.cartId || "",
          franchiseName: item.franchiseName || franchiseName,
          franchiseImageUrl: item.franchiseImageUrl || franchiseImageUrl,
          franchiseId: item.franchiseId || pricing?.franchiseId || "",
          subtotalAmount: Number(pricing?.subtotalAmount ?? 0),
          promotionDiscount: Number(pricing?.promotionDiscount ?? 0),
          voucherDiscount: Number(pricing?.voucherDiscount ?? 0),
          finalAmount: Number(pricing?.finalAmount ?? 0),
          voucherCode: pricing?.voucherCode || "",
          items: [],
        });
      }

      groups.get(key)?.items.push(item);
    });

    return Array.from(groups.values());
  }, [orderItems, franchiseName, franchiseImageUrl, cartPricingMap]);

  const handleCheckoutCart = async (group: {
    cartId: string;
    subtotalAmount: number;
    finalAmount: number;
    voucherCode: string;
    voucherDiscount: number;
    promotionDiscount: number;
    items: typeof orderItems;
  }) => {
    if (checkingOutCartId) return;

    const address = recipient.address.trim();
    const phone = recipient.phone.trim();

    if (!address) {
      toastError("Vui lòng nhập địa chỉ nhận hàng trước khi thanh toán");
      return;
    }

    if (!phone) {
      toastError("Vui lòng nhập số điện thoại trước khi thanh toán");
      return;
    }

    if (!group.cartId) {
      toastError("Không tìm thấy giỏ hàng để checkout");
      return;
    }

    try {
      setCheckingOutCartId(group.cartId);
      const response = await checkoutCart(group.cartId, {
        address,
        phone,
        message: "",
      });
      const orderId = pickOrderId(response);

      if (!orderId) {
        toastError("Không lấy được mã đơn hàng sau khi checkout");
        return;
      }

      navigate(ROUTER_URL.CLIENT_ROUTER.CHECKOUT, {
        state: {
          orderId,
          cartId: group.cartId,
          subtotal: group.subtotalAmount,
          finalAmount: group.finalAmount,
          voucherCode: group.voucherCode,
          voucherDiscount: group.voucherDiscount,
          promotionDiscount: group.promotionDiscount,
          products: group.items,
        },
      });
    } catch (error) {
      toastError(getErrorMessage(error));
    } finally {
      setCheckingOutCartId("");
    }
  };

  return (
    <div className="pb-10 relative">
      <div className="max-w-350 mx-auto py-3 md:py-5 px-4 flex flex-col gap-4">
        <CartHeader count={orderItems.length} />

        {orderItems.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden border-t-4 border-t-primary">
            <div className="p-5">
              <div className="flex items-center gap-2 text-primary text-base font-medium uppercase mb-4">
                <span className="material-symbols-outlined text-xl">
                  location_on
                </span>
                Địa chỉ nhận hàng
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[14px] text-charcoal font-medium ml-1">
                    Tên người nhận
                  </label>
                  <div className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-base text-charcoal">
                    {displayName}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[14px] text-charcoal font-medium ml-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={recipient.phone}
                    onChange={(e) =>
                      setRecipient((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
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
                    value={recipient.address}
                    onChange={(e) =>
                      setRecipient((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-base focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {orderItems.length > 0 ? (
          <div className="flex flex-col gap-4">
            {groupedByCart.map((group) => (
              <section
                key={group.groupId}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <img
                    src={group.franchiseImageUrl}
                    alt={group.franchiseName}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div className="flex flex-col">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">
                      Franchise
                    </p>
                    <p className="text-sm font-semibold text-charcoal">
                      {group.franchiseName}
                    </p>
                  </div>
                </div>

                <div className="p-3">
                  <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-1 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-primary">
                          local_activity
                        </span>
                        <span>Ưu đãi của franchise</span>
                      </div>

                      {group.promotionDiscount > 0 && (
                        <span className="text-xs text-emerald-700 font-medium">
                          Khuyến mãi: -
                          {group.promotionDiscount.toLocaleString()}₫
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          openVoucherModal({
                            cartId: group.cartId,
                            franchiseId: group.franchiseId,
                            franchiseName: group.franchiseName,
                            voucherCode: group.voucherCode,
                          })
                        }
                        className="text-sm font-medium text-primary hover:underline cursor-pointer"
                      >
                        {group.voucherCode
                          ? `Mã đã áp dụng: ${group.voucherCode}`
                          : "Chọn voucher"}
                      </button>
                      {group.voucherCode && (
                        <button
                          type="button"
                          onClick={() => {
                            void handleRemoveVoucher({
                              cartId: group.cartId,
                              franchiseId: group.franchiseId,
                              franchiseName: group.franchiseName,
                            });
                          }}
                          disabled={isApplyingVoucher || isMutatingCart}
                          className="text-xs text-red-500 hover:underline cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Gỡ mã
                        </button>
                      )}
                    </div>
                  </div>

                  <ProductTable
                    items={group.items}
                    variant="cart"
                    onUpdateQuantity={updateQuantity}
                    onRemoveItem={openDeleteSingleModal}
                  />

                  <CartStickyCheckout
                    orderCount={group.items.length}
                    orderItems={group.items}
                    subtotal={group.subtotalAmount}
                    discountAmount={
                      group.voucherDiscount + group.promotionDiscount
                    }
                    discountBreakdown={[
                      {
                        label: "Khuyến mãi",
                        amount: group.promotionDiscount,
                      },
                      {
                        label: "Voucher",
                        amount: group.voucherDiscount,
                      },
                    ].filter((item) => item.amount > 0)}
                    finalTotal={group.finalAmount}
                    onSubmit={() => {
                      void handleCheckoutCart(group);
                    }}
                  />
                </div>
              </section>
            ))}
          </div>
        ) : (
          <CartEmptyState onBackToMenu={() => navigate(ROUTER_URL.MENU)} />
        )}
      </div>

      <CartVoucherModal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        isLoading={isLoadingVouchers || isApplyingVoucher || isMutatingCart}
        vouchers={voucherOptions}
        selectedVoucher={selectedVoucher}
        onApply={(voucher) => {
          setSelectedVoucher(voucher);
          void handleApplyVoucher(voucher, voucherContext?.cartId);
        }}
      />

      <CartDeleteModal
        showDeleteModal={showDeleteModal}
        productToDelete={productToDelete}
        franchiseToDelete={franchiseToDelete}
        selectedCount={orderItems.length}
        onClose={closeDeleteModal}
        onConfirmSingle={handleConfirmDeleteSingle}
        onConfirmMultiple={handleConfirmDeleteMultiple}
      />

      {(isLoadingCart ||
        isApplyingVoucher ||
        isMutatingCart ||
        Boolean(checkingOutCartId)) && <ClientLoading />}
    </div>
  );
};

export default CartPage;
