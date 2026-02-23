import React, { useState } from 'react';

interface VoucherModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (code: string) => void;
}

const VoucherModal: React.FC<VoucherModalProps> = ({ isOpen, onClose, onApply }) => {
    const [voucherCodeInput, setVoucherCodeInput] = useState('');

    if (!isOpen) return null;

    const handleApply = () => {
        if (voucherCodeInput.trim()) {
            onApply(voucherCodeInput);
            setVoucherCodeInput('');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
                    <h2 className="font-bold text-base uppercase tracking-wide text-slate-800">
                        Chọn ChoiCoffee Voucher
                    </h2>
                    <button
                        onClick={onClose}
                        className="material-symbols-outlined text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                        close
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="flex gap-2 mb-6 bg-white p-2 rounded-lg border border-slate-200 focus-within:border-primary transition-all shadow-sm">
                        <input
                            type="text"
                            placeholder="Nhập mã voucher tại đây..."
                            className="flex-1 bg-transparent px-2 outline-none text-sm font-medium uppercase"
                            value={voucherCodeInput}
                            onChange={(e) => setVoucherCodeInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                        />
                        <button
                            className="bg-primary text-white px-6 py-2 rounded-md font-bold text-xs uppercase hover:opacity-90 disabled:bg-slate-200 cursor-pointer"
                            disabled={!voucherCodeInput}
                            onClick={handleApply}
                        >
                            Áp dụng
                        </button>
                    </div>

                    <div className="text-center py-20 border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
                        <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">
                            confirmation_number
                        </span>
                        <p className="text-slate-400 font-medium text-sm">
                            Kho voucher của chi nhánh đang trống
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoucherModal;