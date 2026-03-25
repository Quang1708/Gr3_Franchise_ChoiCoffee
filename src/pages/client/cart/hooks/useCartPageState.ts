import { useCallback, useEffect, useState } from "react";
import { getCartDetail } from "@/components/cart/usecase/getCartDetail.usecase";
import type { OrderItem } from "@/models/order_item.model";
import { useCustomerAuthStore } from "@/stores/customerAuth.store";
import { toastError } from "@/utils/toast.util";
import type { CartVoucher } from "../models/cartVoucher.model";
import { getActiveCartByCustomer } from "../services/getActiveCart.service";
import { updateQuantityItem } from "@/components/cart/usecase/updateItemQuantity.usecase";
import {
  extractCartData,
  extractCartDataList,
  extractCartDisplayMeta,
  extractCartPricing,
  mapCartDataToOrderItems,
} from "../utils/cartApi.mapper";
import type {
  CartPricingMap,
  CartPricingState,
  FranchiseToDelete,
  UpdatePricingMapAndTotals,
  VoucherContext,
} from "./cartState.types";
import { useCartDeleteActions } from "./useCartDeleteActions";
import { useCartVoucherActions } from "./useCartVoucherActions";

export const useCartPageState = () => {
  const customerId = useCustomerAuthStore((s) => s.customerId);

  const [selectedVoucher, setSelectedVoucher] = useState<CartVoucher | null>(
    null,
  );
  const [voucherCode, setVoucherCode] = useState("");
  const [cartId, setCartId] = useState("");
  const [cartPricingMap, setCartPricingMap] = useState<CartPricingMap>({});
  const [voucherOptions, setVoucherOptions] = useState<CartVoucher[]>([]);
  const [voucherContext, setVoucherContext] = useState<VoucherContext | null>(
    null,
  );
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [isMutatingCart, setIsMutatingCart] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<OrderItem | null>(
    null,
  );
  const [franchiseToDelete, setFranchiseToDelete] =
    useState<FranchiseToDelete | null>(null);

  const [orderItems, setOrderItem] = useState<OrderItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [franchiseName, setFranchiseName] = useState("Chi nhánh ChoiCoffee");
  const [franchiseImageUrl, setFranchiseImageUrl] = useState(
    "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=500&q=80",
  );

  const [subtotalAmount, setSubtotalAmount] = useState(0);
  const [promotionDiscount, setPromotionDiscount] = useState(0);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  const updatePricingMapAndTotals: UpdatePricingMapAndTotals = useCallback(
    (
      targetCartId: string,
      updater: (current: CartPricingState) => CartPricingState,
    ) => {
      setCartPricingMap((prev) => {
        const fallbackFranchiseId = voucherContext?.franchiseId || "";
        const current = prev[targetCartId] || {
          cartId: targetCartId,
          franchiseId: fallbackFranchiseId,
          subtotalAmount: 0,
          promotionDiscount: 0,
          voucherDiscount: 0,
          finalAmount: 0,
          voucherCode: "",
        };

        const nextCart = updater(current);
        const nextMap = {
          ...prev,
          [targetCartId]: nextCart,
        };

        const aggregated = Object.values(nextMap).reduce(
          (acc, pricing) => ({
            subtotalAmount:
              acc.subtotalAmount + Number(pricing.subtotalAmount || 0),
            promotionDiscount:
              acc.promotionDiscount + Number(pricing.promotionDiscount || 0),
            voucherDiscount:
              acc.voucherDiscount + Number(pricing.voucherDiscount || 0),
            finalAmount: acc.finalAmount + Number(pricing.finalAmount || 0),
            voucherCode: acc.voucherCode || pricing.voucherCode,
          }),
          {
            subtotalAmount: 0,
            promotionDiscount: 0,
            voucherDiscount: 0,
            finalAmount: 0,
            voucherCode: "",
          },
        );

        setSubtotalAmount(aggregated.subtotalAmount);
        setPromotionDiscount(aggregated.promotionDiscount);
        setVoucherDiscount(aggregated.voucherDiscount);
        setFinalAmount(aggregated.finalAmount);
        setVoucherCode(aggregated.voucherCode);

        return nextMap;
      });
    },
    [voucherContext?.franchiseId],
  );

  const currentFranchiseId =
    Number(localStorage.getItem("selectedFranchise")) || 1;

  const syncCartStateFromList = useCallback(
    (
      carts: ReturnType<typeof extractCartDataList>,
      preferredCartId?: string,
    ) => {
      if (carts.length === 0) {
        setOrderItem([]);
        setSelectedIds([]);
        setSubtotalAmount(0);
        setPromotionDiscount(0);
        setVoucherDiscount(0);
        setFinalAmount(0);
        setVoucherCode("");
        setCartId("");
        setCartPricingMap({});
        return;
      }

      const storedCartId =
        preferredCartId ||
        localStorage.getItem("activeCartId") ||
        localStorage.getItem("selectedCartId") ||
        localStorage.getItem("cart_id") ||
        "";

      const mappedItems = carts.flatMap((cart) =>
        mapCartDataToOrderItems(cart),
      );
      const selectedCart =
        carts.find((cart) => String(cart._id ?? "") === storedCartId) ||
        carts[0];
      const cartMeta = extractCartDisplayMeta(selectedCart);
      const pricingByCartId = carts.reduce<CartPricingMap>((acc, cart) => {
        const pricing = extractCartPricing(cart);
        if (pricing.cartId) {
          acc[pricing.cartId] = pricing;
        }
        return acc;
      }, {});
      const aggregatedPricing = carts
        .map((cart) => extractCartPricing(cart))
        .reduce(
          (acc, pricing) => ({
            subtotalAmount: acc.subtotalAmount + pricing.subtotalAmount,
            promotionDiscount:
              acc.promotionDiscount + pricing.promotionDiscount,
            voucherDiscount: acc.voucherDiscount + pricing.voucherDiscount,
            finalAmount: acc.finalAmount + pricing.finalAmount,
            voucherCode: acc.voucherCode || pricing.voucherCode,
          }),
          {
            subtotalAmount: 0,
            promotionDiscount: 0,
            voucherDiscount: 0,
            finalAmount: 0,
            voucherCode: "",
          },
        );
      const selectedPricing = extractCartPricing(selectedCart);

      setOrderItem(mappedItems);
      setSelectedIds(mappedItems.map((item) => item.productFranchiseId));
      setFranchiseName(cartMeta.franchiseName);
      setFranchiseImageUrl(cartMeta.franchiseImageUrl);
      setSubtotalAmount(aggregatedPricing.subtotalAmount);
      setPromotionDiscount(aggregatedPricing.promotionDiscount);
      setVoucherDiscount(aggregatedPricing.voucherDiscount);
      setFinalAmount(aggregatedPricing.finalAmount);
      setVoucherCode(aggregatedPricing.voucherCode);
      setCartId(selectedPricing.cartId);
      setCartPricingMap(pricingByCartId);
      setVoucherContext((prev) => {
        if (!prev) {
          return prev;
        }

        const updatedPricing = pricingByCartId[prev.cartId];
        if (!updatedPricing) {
          return prev;
        }

        return {
          ...prev,
          franchiseId: updatedPricing.franchiseId,
          voucherCode: updatedPricing.voucherCode,
        };
      });
    },
    [],
  );

  const loadCartFromApi = useCallback(async () => {
    setIsLoadingCart(true);
    try {
      const storedCartId =
        localStorage.getItem("activeCartId") ||
        localStorage.getItem("selectedCartId") ||
        localStorage.getItem("cart_id");

      let carts = [] as ReturnType<typeof extractCartDataList>;

      if (customerId) {
        const activeResponse = await getActiveCartByCustomer(customerId);
        carts = extractCartDataList(activeResponse);
      }

      if (carts.length === 0 && storedCartId) {
        const detailResponse = await getCartDetail(storedCartId);
        const cartData = extractCartData(detailResponse);
        carts = cartData ? [cartData] : [];
      }

      syncCartStateFromList(carts, storedCartId ?? undefined);
    } catch {
      setOrderItem([]);
      setSelectedIds([]);
    } finally {
      setIsLoadingCart(false);
    }
  }, [customerId, syncCartStateFromList]);

  useEffect(() => {
    void loadCartFromApi();
  }, [loadCartFromApi]);

  useEffect(() => {
    const handleCartUpdated = () => {
      void loadCartFromApi();
    };

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, [loadCartFromApi]);

  const toggleSelectItem = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === orderItems.length
        ? []
        : orderItems.map((item) => item.productFranchiseId),
    );
  };

  const updateQuantity = (id: number, delta: number) => {
    const targetItem = orderItems.find(
      (item) => item.productFranchiseId === id,
    );
    if (!targetItem) {
      toastError("Không tìm thấy sản phẩm để cập nhật");
      return;
    }

    const cartItemId = String(targetItem.cartItemId ?? "");
    if (!cartItemId) {
      toastError("Không đủ thông tin để cập nhật số lượng");
      return;
    }

    const nextQuantity = Math.max(1, targetItem.quantity + delta);
    if (nextQuantity === targetItem.quantity) {
      return;
    }

    void (async () => {
      setIsMutatingCart(true);
      try {
        const response = await updateQuantityItem(cartItemId, nextQuantity);
        const isSuccess = Boolean(
          response &&
            typeof response === "object" &&
            "success" in (response as Record<string, unknown>)
            ? (response as { success?: unknown }).success
            : true,
        );

        if (!isSuccess) {
          toastError("Không thể cập nhật số lượng");
          return;
        }

        const updatedCarts = extractCartDataList(response);
        if (updatedCarts.length > 0) {
          syncCartStateFromList(updatedCarts, targetItem.cartId);
        } else {
          await loadCartFromApi();
        }
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        toastError(
          err.response?.data?.message || "Không thể cập nhật số lượng",
        );
      } finally {
        setIsMutatingCart(false);
      }
    })();
  };

  const openVoucherModal = (payload: {
    cartId: string;
    franchiseId: string;
    franchiseName: string;
    voucherCode: string;
  }) => {
    if (!payload.cartId) {
      toastError("Không tìm thấy cart để áp dụng voucher");
      return;
    }

    setVoucherContext(payload);
    setSelectedVoucher(null);
    setShowVoucherModal(true);
  };

  const {
    openDeleteSingleModal,
    openDeleteFranchiseModal,
    closeDeleteModal,
    handleConfirmDeleteSingle,
    handleConfirmDeleteMultiple,
  } = useCartDeleteActions({
    orderItems,
    selectedIds,
    productToDelete,
    franchiseToDelete,
    setIsMutatingCart,
    setShowDeleteModal,
    setProductToDelete,
    setFranchiseToDelete,
    setSelectedIds,
    syncCartStateFromList,
    loadCartFromApi,
  });

  const { handleApplyVoucher, handleRemoveVoucher } = useCartVoucherActions({
    cartId,
    voucherContext,
    setVoucherContext,
    setSelectedVoucher,
    setShowVoucherModal,
    setVoucherOptions,
    setIsLoadingVouchers,
    setIsApplyingVoucher,
    setOrderItem,
    setSelectedIds,
    updatePricingMapAndTotals,
  });

  return {
    currentFranchiseId,
    franchiseName,
    franchiseImageUrl,
    cartId,
    cartPricingMap,
    voucherCode,
    voucherOptions,
    voucherContext,
    selectedVoucher,
    isLoadingCart,
    isLoadingVouchers,
    isApplyingVoucher,
    isMutatingCart,
    orderItems,
    selectedIds,
    showVoucherModal,
    showDeleteModal,
    productToDelete,
    franchiseToDelete,
    subtotal: subtotalAmount,
    voucherDiscount,
    promotionDiscount,
    discountAmount: voucherDiscount + promotionDiscount,
    finalTotal: finalAmount,
    setShowVoucherModal,
    setShowDeleteModal,
    setProductToDelete,
    closeDeleteModal,
    setSelectedVoucher,
    openVoucherModal,
    openDeleteFranchiseModal,
    handleApplyVoucher,
    handleRemoveVoucher,
    toggleSelectItem,
    toggleSelectAll,
    updateQuantity,
    openDeleteSingleModal,
    handleConfirmDeleteSingle,
    handleConfirmDeleteMultiple,
  };
};
