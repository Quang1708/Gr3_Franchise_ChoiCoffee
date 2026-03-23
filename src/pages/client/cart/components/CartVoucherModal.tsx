import type { CartVoucher } from "../models/cartVoucher.model";

type CartVoucherModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  vouchers: CartVoucher[];
  selectedVoucher: CartVoucher | null;
  onClose: () => void;
  onApply: (voucher: CartVoucher) => void;
};

const CartVoucherModal = ({
  isOpen,
  isLoading,
  vouchers,
  selectedVoucher,
  onClose,
  onApply,
}: CartVoucherModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
          <h2 className="font-bold text-base uppercase tracking-wide">
            Chọn Voucher
          </h2>
          <button
            onClick={onClose}
            className="material-symbols-outlined hover:text-red-500 transition cursor-pointer"
          >
            close
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-slate-500">Đang tải voucher...</p>
          ) : vouchers.length === 0 ? (
            <p className="text-sm text-slate-500">Không có voucher khả dụng.</p>
          ) : (
            <div className="space-y-3">
              {vouchers.map((voucher) => {
                const isExpired = voucher.endTime
                  ? new Date(voucher.endTime).getTime() < Date.now()
                  : false;
                const disabled = !voucher.isActive || isExpired;

                return (
                  <button
                    key={voucher.id}
                    type="button"
                    onClick={() => onApply(voucher)}
                    disabled={disabled}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                      disabled
                        ? "cursor-not-allowed border-slate-200 opacity-50"
                        : "cursor-pointer border-slate-300 hover:border-primary"
                    } ${selectedVoucher?.id === voucher.id ? "border-primary bg-primary/5" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {voucher.code}
                        </p>
                        <p className="text-sm text-slate-600">
                          Giảm{" "}
                          {voucher.type === "PERCENT"
                            ? `${voucher.value}%`
                            : `${voucher.value.toLocaleString()}đ`}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">
                        {voucher.endTime
                          ? `HSD: ${new Date(voucher.endTime).toLocaleDateString("vi-VN")}`
                          : ""}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartVoucherModal;
