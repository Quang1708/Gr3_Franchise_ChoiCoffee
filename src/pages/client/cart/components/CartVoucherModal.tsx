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
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
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

        <div className="flex flex-col gap-5 pl-5 pt-5 pb-5 flex-1 overflow-hidden">
          <div className="mr-6 flex gap-2 bg-white p-1 rounded-md border border-slate-200 focus-within:border-primary transition">
            <input
              type="text"
              placeholder="Nhập mã voucher..."
              className="flex-1 bg-transparent px-2 outline-none text-sm italic"
              value={selectedVoucher?.code ?? ""}
              readOnly
            />
            <button
              type="button"
              className="bg-primary text-white px-5 py-2 rounded-md text-sm font-medium opacity-70 cursor-not-allowed"
              disabled
            >
              Áp dụng
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll pr-4">
            {isLoading ? (
              <p className="text-sm text-slate-500">Đang tải voucher...</p>
            ) : vouchers.length === 0 ? (
              <p className="text-sm text-slate-500">Không có voucher khả dụng.</p>
            ) : (
              <div className="space-y-4">
                {vouchers.map((voucher) => {
                  const isSelected = selectedVoucher?.id === voucher.id;
                  const isExpired = voucher.endTime
                    ? new Date(voucher.endTime) < new Date()
                    : false;

                  return (
                    <button
                      key={voucher.id}
                      type="button"
                      onClick={() => onApply(voucher)}
                      className={`
                        relative w-full flex border border-slate-200 border-l-0 rounded-r-md overflow-hidden text-left
                        transition-all duration-200 cursor-pointer hover:border-primary/50
                        ${isSelected ? "border-primary shadow-md scale-[1.01]" : ""}
                      `}
                    >
                      <div className="absolute -left-1.75 top-0 bottom-0 w-3 flex flex-col justify-around z-10">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="size-3 bg-white rounded-full border border-slate-200"
                          />
                        ))}
                      </div>

                      <div className="w-28 bg-primary/5 border-r border-dashed border-slate-300 flex flex-col items-center justify-center p-3">
                        <span className="material-symbols-outlined text-primary text-3xl mb-1">
                          {voucher.type === "PERCENT" ? "percent" : "payments"}
                        </span>
                        <span className="text-xs font-medium text-primary uppercase">
                          Voucher
                        </span>
                      </div>

                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                          <h3 className="text-base font-bold uppercase">
                            {voucher.code}
                          </h3>
                          <p className="text-xs text-charcoal mt-1">
                            Giảm{" "}
                            {voucher.type === "PERCENT"
                              ? `${voucher.value}%`
                              : `${voucher.value.toLocaleString()}đ`}
                          </p>
                        </div>

                        <div className="flex justify-between items-center mt-1">
                          <span
                            className={`text-xs font-medium ${
                              isExpired ? "text-gray-400" : "text-red-500"
                            }`}
                          >
                            {voucher.endTime
                              ? isExpired
                                ? "Đã hết hạn"
                                : `HSD: ${new Date(voucher.endTime).toLocaleDateString("vi-VN")}`
                              : ""}
                          </span>

                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                              isSelected
                                ? "border-primary scale-110"
                                : "border-slate-300"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary scale-110" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartVoucherModal;
