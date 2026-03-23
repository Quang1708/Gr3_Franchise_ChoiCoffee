import React from "react";
import { useNavigate } from "react-router-dom";
import ProductTable from "@components/Client/ProductTable/ProductTable";
import ROUTER_URL from "@/routes/router.const";
import ClientLoading from "@/components/Client/Client.Loading";
import CartDeleteModal from "./components/CartDeleteModal";
import CartEmptyState from "./components/CartEmptyState";
import CartHeader from "./components/CartHeader";
import CartStickyCheckout from "./components/CartStickyCheckout";
import CartVoucherModal from "./components/CartVoucherModal";
import { useCartPageState } from "./hooks/useCartPageState";

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    franchiseName,
    franchiseImageUrl,
    cartId,
    voucherCode,
    cartPricingMap,
    voucherOptions,
    voucherContext,
    selectedVoucher,
    isLoadingVouchers,
    isApplyingVoucher,
    isMutatingCart,
    orderItems,
    showVoucherModal,
    showDeleteModal,
    productToDelete,
    franchiseToDelete,
    subtotal,
    discountAmount,
    finalTotal,
    setShowVoucherModal,
    closeDeleteModal,
    setSelectedVoucher,
    openVoucherModal,
    openDeleteFranchiseModal,
    handleApplyVoucher,
    handleRemoveVoucher,
    updateQuantity,
    openDeleteSingleModal,
    handleConfirmDeleteSingle,
    handleConfirmDeleteMultiple,
  } = useCartPageState();

  const groupedByFranchise = React.useMemo(() => {
    const groups = new Map<
      string,
      {
        cartId: string;
        franchiseName: string;
        franchiseImageUrl: string;
        franchiseId: string;
        voucherCode: string;
        items: typeof orderItems;
      }
    >();

    orderItems.forEach((item) => {
      const key =
        item.franchiseId || item.franchiseName || franchiseName || "default";

      if (!groups.has(key)) {
        const pricing = item.cartId ? cartPricingMap[item.cartId] : undefined;
        groups.set(key, {
          cartId: item.cartId || "",
          franchiseName: item.franchiseName || franchiseName,
          franchiseImageUrl: item.franchiseImageUrl || franchiseImageUrl,
          franchiseId: item.franchiseId || pricing?.franchiseId || "",
          voucherCode: pricing?.voucherCode || "",
          items: [],
        });
      }

      groups.get(key)?.items.push(item);
    });

    return Array.from(groups.values());
  }, [orderItems, franchiseName, franchiseImageUrl, cartPricingMap]);

  const discountBreakdown = React.useMemo(() => {
    return groupedByFranchise
      .map((group) => {
        const pricing = group.cartId ? cartPricingMap[group.cartId] : undefined;
        const amount = Number(pricing?.voucherDiscount ?? 0);

        return {
          label: group.franchiseName,
          amount,
        };
      })
      .filter((item) => item.amount > 0);
  }, [groupedByFranchise, cartPricingMap]);

  return (
    <div className="pb-10 relative">
      <div className="max-w-350 mx-auto py-3 md:py-5 px-4 flex flex-col gap-4">
        <CartHeader count={orderItems.length} />

        {orderItems.length > 0 ? (
          <div className="flex flex-col gap-4">
            {groupedByFranchise.map((group, index) => (
              <section
                key={`${group.franchiseName}-${index}`}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <img
                    src={group.franchiseImageUrl}
                    alt={group.franchiseName}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">
                        Franchise
                      </p>
                      <p className="text-sm font-semibold text-charcoal">
                        {group.franchiseName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        openDeleteFranchiseModal(
                          group.items
                            .map((item) => String(item.cartItemId ?? ""))
                            .filter(Boolean),
                          group.franchiseName,
                        )
                      }
                      disabled={!group.cartId}
                      className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">
                        delete
                      </span>
                      Xóa franchise
                    </button>
                  </div>
                </div>

                <div className="p-3">
                  <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="material-symbols-outlined text-base text-primary">
                        local_activity
                      </span>
                      <span>Voucher của franchise</span>
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
                        className="text-sm font-medium text-primary hover:underline"
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
                          className="text-xs text-red-500 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
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
                </div>
              </section>
            ))}

            <CartStickyCheckout
              orderCount={orderItems.length}
              orderItems={orderItems}
              subtotal={subtotal}
              discountAmount={discountAmount}
              discountBreakdown={discountBreakdown}
              finalTotal={finalTotal}
              onSubmit={() => {
                navigate(ROUTER_URL.CLIENT_ROUTER.CHECKOUT, {
                  state: {
                    products: orderItems,
                    subtotal,
                    finalAmount: finalTotal,
                    voucherCode,
                    voucherDiscount: discountAmount,
                    cartId,
                  },
                });
              }}
            />
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

      {(isApplyingVoucher || isMutatingCart) && <ClientLoading />}
    </div>
  );
};

export default CartPage;
