import { toastError, toastSuccess } from "@/utils/toast.util";
import { deleteItem } from "@/components/cart/usecase/deleteItem.usecase";
import { cancelCart } from "@/components/cart/usecase/cancelCart.usecase";
import type { Dispatch, SetStateAction } from "react";
import { extractCartDataList } from "../utils/cartApi.mapper";
import type { OrderItem } from "@/models/order_item.model";
import type {
  CartError,
  FranchiseToDelete,
  SetSelectedIds,
} from "./cartState.types";

type UseCartDeleteActionsParams = {
  orderItems: OrderItem[];
  selectedIds: number[];
  productToDelete: OrderItem | null;
  franchiseToDelete: FranchiseToDelete | null;
  setIsMutatingCart: Dispatch<SetStateAction<boolean>>;
  setShowDeleteModal: Dispatch<SetStateAction<boolean>>;
  setProductToDelete: Dispatch<SetStateAction<OrderItem | null>>;
  setFranchiseToDelete: Dispatch<SetStateAction<FranchiseToDelete | null>>;
  setSelectedIds: SetSelectedIds;
  syncCartStateFromList: (
    carts: ReturnType<typeof extractCartDataList>,
    preferredCartId?: string,
  ) => void;
  loadCartFromApi: () => Promise<void>;
};

export const useCartDeleteActions = ({
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
}: UseCartDeleteActionsParams) => {
  const openDeleteSingleModal = (id: number) => {
    const item = orderItems.find(
      (orderItem) => orderItem.productFranchiseId === id,
    );
    if (item) {
      setProductToDelete(item);
    }
  };

  const openDeleteFranchiseModal = (
    targetCartId: string,
    targetFranchiseName: string,
    targetItemCount: number,
  ) => {
    if (!targetCartId.trim()) {
      toastError("Không tìm thấy giỏ hàng để hủy");
      return;
    }

    setFranchiseToDelete({
      cartId: targetCartId,
      itemCount: targetItemCount,
      franchiseName: targetFranchiseName,
    });
    setShowDeleteModal(true);
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
        toastError("Không đủ thông tin để xóa sản phẩm");
        return;
      }

      const response = await deleteItem(cartItemId);
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
      const err = error as CartError;
      toastError(err.response?.data?.message || "Không thể xóa sản phẩm");
    } finally {
      setIsMutatingCart(false);
    }
  };

  const handleConfirmDeleteMultiple = async () => {
    const deleteCartItemIds = async (cartItemIds: string[]) => {
      for (const cartItemId of cartItemIds) {
        await deleteItem(cartItemId);
      }
    };

    if (franchiseToDelete) {
      setIsMutatingCart(true);
      try {
        await cancelCart(franchiseToDelete.cartId);

        toastSuccess("Đã hủy giỏ hàng của franchise");
        closeDeleteModal();
        await loadCartFromApi();
      } catch (error) {
        const err = error as CartError;
        toastError(err.response?.data?.message || "Không thể hủy giỏ hàng");
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

      await deleteCartItemIds(selectedCartItemIds);

      toastSuccess("Đã xóa các sản phẩm đã chọn");
      setSelectedIds([]);
      closeDeleteModal();
      await loadCartFromApi();
    } catch (error) {
      const err = error as CartError;
      toastError(
        err.response?.data?.message || "Không thể xóa các giỏ hàng đã chọn",
      );
    } finally {
      setIsMutatingCart(false);
    }
  };

  return {
    openDeleteSingleModal,
    openDeleteFranchiseModal,
    closeDeleteModal,
    handleConfirmDeleteSingle,
    handleConfirmDeleteMultiple,
  };
};
