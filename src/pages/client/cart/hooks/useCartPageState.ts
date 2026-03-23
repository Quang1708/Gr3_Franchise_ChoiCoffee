import { useCallback, useEffect, useState } from "react";
import { getCartDetail } from "@/components/cart/usecase/getCartDetail.usecase";
import type { OrderItem } from "@/models/order_item.model";
import { useCustomerAuthStore } from "@/stores/customerAuth.store";
import { getVouchersByFranchiseId } from "@/services/voucher.service";
import { toastError, toastSuccess } from "@/utils/toast.util";
import type { CartVoucher } from "../models/cartVoucher.model";
import { applyVoucherCart11Service } from "../services/cart11.service";
import { removeVoucherCart12Service } from "../services/cart12.service";
import { deleteFranchiseCartService } from "../services/cartDeleteFranchise.service";
import { deleteCartItemService } from "../services/cartDeleteItem.service";
import { getActiveCartByCustomer } from "../services/getActiveCart.service";
import {
  extractCartData,
  extractCartDataList,
  extractCartDisplayMeta,
  extractCartPricing,
  mapCartDataToOrderItems,
} from "../utils/cartApi.mapper";

export const useCartPageState = () => {
  const customerId = useCustomerAuthStore((s) => s.customerId);

  const [selectedVoucher, setSelectedVoucher] = useState<CartVoucher | null>(
    null,
  );
  const [voucherCode, setVoucherCode] = useState("");
  const [cartId, setCartId] = useState("");
  const [cartPricingMap, setCartPricingMap] = useState<
    Record<
      string,
      {
        cartId: string;
        franchiseId: string;
        subtotalAmount: number;
        voucherDiscount: number;
        finalAmount: number;
        voucherCode: string;
      }
    >
  >({});
  const [voucherOptions, setVoucherOptions] = useState<CartVoucher[]>([]);
  const [voucherContext, setVoucherContext] = useState<{
    cartId: string;
    franchiseId: string;
    franchiseName: string;
    voucherCode: string;
  } | null>(null);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [isMutatingCart, setIsMutatingCart] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<OrderItem | null>(
    null,
  );
  const [franchiseToDelete, setFranchiseToDelete] = useState<{
    cartItemIds: string[];
    franchiseName: string;
  } | null>(null);

  const [orderItems, setOrderItem] = useState<OrderItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [franchiseName, setFranchiseName] = useState("Chi nhánh ChoiCoffee");
  const [franchiseImageUrl, setFranchiseImageUrl] = useState(
    "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=500&q=80",
  );

  const [subtotalAmount, setSubtotalAmount] = useState(0);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  const updatePricingMapAndTotals = useCallback(
    (
      targetCartId: string,
      updater: (current: {
        cartId: string;
        franchiseId: string;
        subtotalAmount: number;
        voucherDiscount: number;
        finalAmount: number;
        voucherCode: string;
      }) => {
        cartId: string;
        franchiseId: string;
        subtotalAmount: number;
        voucherDiscount: number;
        finalAmount: number;
        voucherCode: string;
      },
    ) => {
      setCartPricingMap((prev) => {
        const fallbackFranchiseId = voucherContext?.franchiseId || "";
        const current = prev[targetCartId] || {
          cartId: targetCartId,
          franchiseId: fallbackFranchiseId,
          subtotalAmount: 0,
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
            voucherDiscount:
              acc.voucherDiscount + Number(pricing.voucherDiscount || 0),
            finalAmount: acc.finalAmount + Number(pricing.finalAmount || 0),
            voucherCode: acc.voucherCode || pricing.voucherCode,
          }),
          {
            subtotalAmount: 0,
            voucherDiscount: 0,
            finalAmount: 0,
            voucherCode: "",
          },
        );

        setSubtotalAmount(aggregated.subtotalAmount);
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
      const pricingByCartId = carts.reduce<
        Record<
          string,
          {
            cartId: string;
            franchiseId: string;
            subtotalAmount: number;
            voucherDiscount: number;
            finalAmount: number;
            voucherCode: string;
          }
        >
      >((acc, cart) => {
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
            voucherDiscount: acc.voucherDiscount + pricing.voucherDiscount,
            finalAmount: acc.finalAmount + pricing.finalAmount,
            voucherCode: acc.voucherCode || pricing.voucherCode,
          }),
          {
            subtotalAmount: 0,
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
    }
  }, [customerId, syncCartStateFromList]);

  useEffect(() => {
    void loadCartFromApi();
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
    setOrderItem((prev) =>
      prev.map((item) =>
        item.productFranchiseId === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const openDeleteSingleModal = (id: number) => {
    const item = orderItems.find(
      (orderItem) => orderItem.productFranchiseId === id,
    );
    if (item) {
      setProductToDelete(item);
    }
  };

  const openDeleteFranchiseModal = (
    targetCartItemIds: string[],
    targetFranchiseName: string,
  ) => {
    const validCartItemIds = targetCartItemIds.filter(Boolean);

    if (validCartItemIds.length === 0) {
      toastError("Không tìm thấy sản phẩm trong franchise để xóa");
      return;
    }

    setFranchiseToDelete({
      cartItemIds: validCartItemIds,
      franchiseName: targetFranchiseName,
    });
    setShowDeleteModal(true);
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

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
    setFranchiseToDelete(null);
  };

  const handleConfirmDeleteSingle = async () => {
    if (!productToDelete) {
      return;
    }

    const currentItem = productToDelete;
    const cartItemId = String(currentItem.cartItemId ?? "");

    setIsMutatingCart(true);
    try {
      if (!cartItemId) {
        console.log("[Cart] delete-item invalid payload", {
          currentItem,
          cartItemId,
        });
        toastError("Không đủ thông tin để xóa sản phẩm");
        return;
      }

      console.log("[Cart] delete-item request", { cart_item_id: cartItemId });
      const response = await deleteCartItemService(cartItemId);
      console.log("[Cart] delete-item response", response);
      const isSuccess = Boolean(
        response &&
          typeof response === "object" &&
          "success" in (response as Record<string, unknown>)
          ? (response as { success?: unknown }).success
          : true,
      );

      if (!isSuccess) {
        toastError("Không thể xóa sản phẩm");
        return;
      }

      toastSuccess("Đã xóa sản phẩm khỏi franchise");

      const updatedCarts = extractCartDataList(response);
      if (updatedCarts.length > 0) {
        syncCartStateFromList(updatedCarts, currentItem.cartId);
      } else {
        await loadCartFromApi();
      }
      setProductToDelete(null);
    } catch (error) {
      console.log("[Cart] delete-item error", error);
      const err = error as { response?: { data?: { message?: string } } };
      toastError(err.response?.data?.message || "Không thể xóa sản phẩm");
    } finally {
      setIsMutatingCart(false);
    }
  };

  const handleConfirmDeleteMultiple = async () => {
    if (franchiseToDelete) {
      setIsMutatingCart(true);
      try {
        const response = await deleteFranchiseCartService(
          franchiseToDelete.cartItemIds,
        );
        const isSuccess = Boolean(
          response &&
            typeof response === "object" &&
            "success" in (response as Record<string, unknown>)
            ? (response as { success?: unknown }).success
            : true,
        );

        if (!isSuccess) {
          toastError("Không thể xóa giỏ hàng của franchise");
          return;
        }

        toastSuccess("Đã xóa giỏ hàng của franchise");
        closeDeleteModal();
        await loadCartFromApi();
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        toastError(err.response?.data?.message || "Không thể xóa franchise");
      } finally {
        setIsMutatingCart(false);
      }
      return;
    }

    setIsMutatingCart(true);
    try {
      const selectedItems = orderItems.filter((item) =>
        selectedIds.includes(item.productFranchiseId),
      );
      const selectedCartItemIds = Array.from(
        new Set(
          selectedItems
            .map((item) => String(item.cartItemId ?? ""))
            .filter(Boolean),
        ),
      ) as string[];

      if (selectedCartItemIds.length === 0) {
        toastError("Không có sản phẩm nào để xóa");
        return;
      }

      await deleteFranchiseCartService(selectedCartItemIds);

      toastSuccess("Đã xóa các sản phẩm đã chọn");
      setSelectedIds([]);
      closeDeleteModal();
      await loadCartFromApi();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toastError(
        err.response?.data?.message || "Không thể xóa các giỏ hàng đã chọn",
      );
    } finally {
      setIsMutatingCart(false);
    }
  };

  const refreshVoucherOptions = useCallback(
    async (franchiseId?: string) => {
      const targetFranchiseId =
        franchiseId || voucherContext?.franchiseId || "";

      if (!targetFranchiseId) {
        setVoucherOptions([]);
        return;
      }

      setIsLoadingVouchers(true);
      try {
        const vouchers = await getVouchersByFranchiseId(targetFranchiseId);

        const mapped = vouchers.map(
          (item) =>
            ({
              id: String(item.id),
              code: item.code,
              type: item.type,
              value: Number(item.value ?? 0),
              endTime: item.endTime,
              isActive: Boolean(item.isActive),
            }) satisfies CartVoucher,
        );

        setVoucherOptions(mapped);
      } catch {
        setVoucherOptions([]);
      } finally {
        setIsLoadingVouchers(false);
      }
    },
    [voucherContext?.franchiseId],
  );

  useEffect(() => {
    void refreshVoucherOptions();
  }, [refreshVoucherOptions]);

  const handleApplyVoucher = async (
    voucher: CartVoucher,
    targetCartId?: string,
  ) => {
    const effectiveCartId = targetCartId || voucherContext?.cartId || cartId;

    console.log("[Cart] apply voucher click", {
      cartId: effectiveCartId,
      voucher,
    });
    if (!effectiveCartId) {
      toastError("Không tìm thấy cart id để áp dụng voucher");
      return;
    }

    setIsApplyingVoucher(true);
    try {
      const response = await applyVoucherCart11Service(
        effectiveCartId,
        voucher.code,
      );
      const isSuccess = Boolean(
        response &&
          typeof response === "object" &&
          "success" in (response as Record<string, unknown>)
          ? (response as { success?: unknown }).success
          : true,
      );
      if (!isSuccess) {
        toastError("Không thể áp dụng voucher");
        return;
      }

      const cartData = extractCartData(response);
      if (cartData) {
        const mappedItems = mapCartDataToOrderItems(cartData);
        const pricing = extractCartPricing(cartData);

        setOrderItem((prev) => {
          const merged = [
            ...prev.filter((item) => item.cartId !== effectiveCartId),
            ...mappedItems,
          ];
          setSelectedIds(merged.map((item) => item.productFranchiseId));
          return merged;
        });

        updatePricingMapAndTotals(effectiveCartId, (current) => ({
          ...current,
          ...pricing,
          cartId: effectiveCartId,
          voucherCode: pricing.voucherCode || voucher.code,
        }));
      } else {
        updatePricingMapAndTotals(effectiveCartId, (current) => {
          const baseSubtotal = Number(current.subtotalAmount || 0);
          const rawDiscount =
            voucher.type === "PERCENT"
              ? (baseSubtotal * voucher.value) / 100
              : voucher.value;
          const discount = Math.max(
            0,
            Math.min(baseSubtotal, Math.round(rawDiscount)),
          );

          return {
            ...current,
            voucherDiscount: discount,
            finalAmount: Math.max(0, baseSubtotal - discount),
            voucherCode: voucher.code,
          };
        });
      }

      setSelectedVoucher(voucher);
      setVoucherContext((prev) =>
        prev
          ? {
              ...prev,
              voucherCode: voucher.code,
            }
          : prev,
      );
      setShowVoucherModal(false);
      await refreshVoucherOptions(voucherContext?.franchiseId);
      toastSuccess("Áp dụng voucher thành công");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toastError(err.response?.data?.message || "Không thể áp dụng voucher");
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = async (target?: {
    cartId: string;
    franchiseId: string;
    franchiseName?: string;
  }) => {
    const effectiveCartId = target?.cartId || voucherContext?.cartId || cartId;
    const effectiveFranchiseId =
      target?.franchiseId || voucherContext?.franchiseId || "";

    if (target) {
      setVoucherContext((prev) => ({
        cartId: target.cartId,
        franchiseId: target.franchiseId,
        franchiseName: target.franchiseName || prev?.franchiseName || "",
        voucherCode: "",
      }));
    }

    if (!effectiveCartId) {
      toastError("Không tìm thấy cart id để gỡ voucher");
      return;
    }

    if (!effectiveFranchiseId) {
      toastError("Không tìm thấy franchise để gỡ voucher");
      return;
    }

    setIsApplyingVoucher(true);
    try {
      const response = await removeVoucherCart12Service(effectiveCartId);
      const isSuccess = Boolean(
        response &&
          typeof response === "object" &&
          "success" in (response as Record<string, unknown>)
          ? (response as { success?: unknown }).success
          : true,
      );
      if (!isSuccess) {
        toastError("Không thể gỡ voucher");
        return;
      }

      const cartData = extractCartData(response);
      if (cartData) {
        const mappedItems = mapCartDataToOrderItems(cartData);
        const pricing = extractCartPricing(cartData);

        setOrderItem((prev) => {
          const merged = [
            ...prev.filter((item) => item.cartId !== effectiveCartId),
            ...mappedItems,
          ];
          setSelectedIds(merged.map((item) => item.productFranchiseId));
          return merged;
        });

        updatePricingMapAndTotals(effectiveCartId, (current) => ({
          ...current,
          ...pricing,
          cartId: effectiveCartId,
          voucherCode: "",
          voucherDiscount: Number(pricing.voucherDiscount || 0),
        }));
      } else {
        updatePricingMapAndTotals(effectiveCartId, (current) => ({
          ...current,
          voucherCode: "",
          voucherDiscount: 0,
          finalAmount: Number(current.subtotalAmount || 0),
        }));
      }

      setSelectedVoucher(null);
      setVoucherContext((prev) =>
        prev
          ? {
              ...prev,
              voucherCode: "",
            }
          : prev,
      );
      await refreshVoucherOptions(effectiveFranchiseId);
      toastSuccess("Đã gỡ voucher");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toastError(err.response?.data?.message || "Không thể gỡ voucher");
    } finally {
      setIsApplyingVoucher(false);
    }
  };

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
    discountAmount: voucherDiscount,
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
