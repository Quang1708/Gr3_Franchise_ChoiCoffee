import { useCallback, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { getVouchersByFranchiseId } from "@/services/voucher.service";
import { toastError, toastSuccess } from "@/utils/toast.util";
import type { CartVoucher } from "../models/cartVoucher.model";
import { applyVoucherCart11Service } from "../services/cart11.service";
import { removeVoucherCart12Service } from "../services/cart12.service";
import {
  extractCartData,
  mapCartDataToOrderItems,
  extractCartPricing,
} from "../utils/cartApi.mapper";
import type {
  CartError,
  SetOrderItems,
  SetSelectedIds,
  SetSelectedVoucher,
  UpdatePricingMapAndTotals,
  VoucherContext,
} from "./cartState.types";

type UseCartVoucherActionsParams = {
  cartId: string;
  voucherContext: VoucherContext | null;
  setVoucherContext: Dispatch<SetStateAction<VoucherContext | null>>;
  setSelectedVoucher: SetSelectedVoucher;
  setShowVoucherModal: Dispatch<SetStateAction<boolean>>;
  setVoucherOptions: Dispatch<SetStateAction<CartVoucher[]>>;
  setIsLoadingVouchers: Dispatch<SetStateAction<boolean>>;
  setIsApplyingVoucher: Dispatch<SetStateAction<boolean>>;
  setOrderItem: SetOrderItems;
  setSelectedIds: SetSelectedIds;
  updatePricingMapAndTotals: UpdatePricingMapAndTotals;
};

export const useCartVoucherActions = ({
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
}: UseCartVoucherActionsParams) => {
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
        const now = Date.now();

        const mapped = vouchers
          .map(
            (item) =>
              ({
                id: String(item.id),
                code: item.code,
                type: item.type,
                value: Number(item.value ?? 0),
                startTime: item.startTime,
                endTime: item.endTime,
                quotaTotal: Number(item.quotaTotal ?? 0),
                quotaUsed: Number(item.quotaUsed ?? 0),
                isActive: Boolean(item.isActive),
              }) satisfies CartVoucher,
          )
          .filter((voucher) => {
            if (!voucher.isActive) return false;

            const remainingQuota = voucher.quotaTotal - voucher.quotaUsed;
            if (remainingQuota <= 0) return false;

            const startAt = voucher.startTime
              ? new Date(voucher.startTime).getTime()
              : null;
            if (startAt !== null && Number.isFinite(startAt) && now < startAt) {
              return false;
            }

            const endAt = voucher.endTime
              ? new Date(voucher.endTime).getTime()
              : null;
            if (endAt !== null && Number.isFinite(endAt) && now > endAt) {
              return false;
            }

            return true;
          });

        setVoucherOptions(mapped);
      } catch {
        setVoucherOptions([]);
      } finally {
        setIsLoadingVouchers(false);
      }
    },
    [setIsLoadingVouchers, setVoucherOptions, voucherContext?.franchiseId],
  );

  useEffect(() => {
    void refreshVoucherOptions();
  }, [refreshVoucherOptions]);

  const handleApplyVoucher = async (
    voucher: CartVoucher,
    targetCartId?: string,
  ) => {
    const effectiveCartId = targetCartId || voucherContext?.cartId || cartId;

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
            finalAmount: Math.max(
              0,
              baseSubtotal - Number(current.promotionDiscount || 0) - discount,
            ),
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
      const err = error as CartError;
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
          finalAmount: Math.max(
            0,
            Number(current.subtotalAmount || 0) -
              Number(current.promotionDiscount || 0),
          ),
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
      const err = error as CartError;
      toastError(err.response?.data?.message || "Không thể gỡ voucher");
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  return {
    refreshVoucherOptions,
    handleApplyVoucher,
    handleRemoveVoucher,
  };
};
