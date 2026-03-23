import type { OrderItem } from "@/models/order_item.model";

type CartDeleteModalProps = {
  showDeleteModal: boolean;
  productToDelete: OrderItem | null;
  franchiseToDelete?: { cartItemIds: string[]; franchiseName: string } | null;
  selectedCount: number;
  onClose: () => void;
  onConfirmSingle: () => void;
  onConfirmMultiple: () => void;
};

const CartDeleteModal = ({
  showDeleteModal,
  productToDelete,
  franchiseToDelete,
  selectedCount,
  onClose,
  onConfirmSingle,
  onConfirmMultiple,
}: CartDeleteModalProps) => {
  if (!showDeleteModal && !productToDelete && !franchiseToDelete) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl animate-in zoom-in fade-in duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="size-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl">
              {productToDelete ? "delete" : "storefront"}
            </span>
          </div>

          <h2 className="font-bold text-xl text-charcoal mb-2">
            {productToDelete
              ? "Xóa sản phẩm?"
              : franchiseToDelete
                ? "Xóa giỏ hàng franchise?"
                : "Xóa các mục đã chọn?"}
          </h2>

          <p className="text-charcoal-500 mb-8 leading-relaxed text-[14px] px-2">
            {productToDelete ? (
              <>
                Sản phẩm{" "}
                <span className="font-medium text-charcoal italic">
                  "{productToDelete.productNameSnapshot}"
                </span>{" "}
                sẽ được loại khỏi giỏ hàng của bạn.
              </>
            ) : franchiseToDelete ? (
              <>
                Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng của franchise{" "}
                <span className="font-medium text-charcoal italic">
                  "{franchiseToDelete.franchiseName}"
                </span>
                ? ({franchiseToDelete.cartItemIds.length} sản phẩm)
              </>
            ) : (
              <>
                Bạn có chắc chắn muốn loại bỏ{" "}
                <span className="font-medium text-red-500">
                  {selectedCount}
                </span>{" "}
                sản phẩm này khỏi giỏ hàng không?
              </>
            )}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg font-medium text-charcoal bg-slate-100 hover:bg-slate-200 transition-all text-[14px] cursor-pointer"
          >
            {productToDelete ? "Quay lại" : "Hủy"}
          </button>
          <button
            onClick={productToDelete ? onConfirmSingle : onConfirmMultiple}
            className="flex-1 py-2.5 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all text-[14px] active:scale-95 cursor-pointer"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartDeleteModal;
