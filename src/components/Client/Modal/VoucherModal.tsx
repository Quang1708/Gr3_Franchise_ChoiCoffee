import type { Promotion } from '@/models/promotion.model';
import React, { useEffect, useMemo, useState } from 'react';

interface VoucherModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (promotion: Promotion | null) => void;
    promotions: Promotion[];
    OrderItems: any[];
    selectedIds: number[];
    currentFranchiseId: number;
    selectedPromotion: Promotion | null;
}
const VoucherModal: React.FC<VoucherModalProps> = ({
    isOpen,
    onClose,
    onApply,
    promotions,
    OrderItems,
    selectedIds,
    currentFranchiseId,
    selectedPromotion,
}) => {
    const [selectedPromoId, setSelectedPromoId] = useState<number | null>(null);
    const [voucherCodeInput, setVoucherCodeInput] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSelectedPromoId(selectedPromotion?.id ?? null);
        }
    }, [isOpen, selectedPromotion]);

    const now = new Date();

    const getPromotionError = (
        promo: Promotion,
        currentFranchiseId: number,
        OrderItems: any[],
        selectedIds: number[]
    ) => {
        if (!promo.isActive) return "Voucher đã bị vô hiệu hóa";
        if (promo.isDeleted) return "Voucher không tồn tại";
        if (new Date(promo.startTime) > now) return "Chương trình chưa bắt đầu";
        if (new Date(promo.endTime) < now) return "Voucher đã hết hạn";

        if (promo.franchiseId !== currentFranchiseId)
            return "Voucher không thuộc chi nhánh này";

        if (promo.productFranchiseId) {
            const isProductSelected = OrderItems.some(
                (item: any) =>
                    selectedIds.includes(item.productFranchiseId) &&
                    item.productFranchiseId === promo.productFranchiseId
            );
            if (!isProductSelected)
                return "Sản phẩm áp dụng voucher này không có trong danh sách thanh toán";
        }

        return null;
    };

    const sortedPromotions = useMemo(() => {
        return promotions
            .filter(promo => promo.franchiseId === currentFranchiseId)
            .sort((a, b) => {
                const aExpired = new Date(a.endTime) < now;
                const bExpired = new Date(b.endTime) < now;
                return Number(aExpired) - Number(bExpired);
            });
    }, [promotions, currentFranchiseId, now]);

    if (!isOpen) return null;

    const handleApply = () => {
        if (selectedPromoId) {
            const promo = promotions.find(p => p.id === selectedPromoId);
            if (promo) onApply(promo);
        } else {
            onApply(null);
        }

        setVoucherCodeInput('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* HEADER */}
                <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                    <h2 className="font-bold text-base uppercase tracking-wide">
                        Chọn Voucher
                    </h2>

                    <button
                        onClick={onClose}
                        className="material-symbols-outlined hover:text-red-500 transition"
                    >
                        close
                    </button>
                </div>

                {/* BODY */}
                <div className="flex flex-col gap-5 pl-5 pt-5 pb-5 flex-1 overflow-hidden">

                    {/* INPUT */}
                    <div className="mr-6 flex gap-2 bg-white p-1 rounded-md border border-slate-200 focus-within:border-primary transition">
                        <input
                            type="text"
                            placeholder="Nhập mã voucher..."
                            className="flex-1 bg-transparent px-2 outline-none text-sm italic"
                            value={voucherCodeInput}
                            onChange={(e) => setVoucherCodeInput(e.target.value)}
                        />
                        <button
                            className="bg-primary text-white px-5 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:bg-slate-200"
                            disabled={!voucherCodeInput}
                        >
                            Áp dụng
                        </button>
                    </div>

                    {/* SCROLL AREA */}
                    <div className="flex-1 overflow-y-auto custom-scroll pr-4">
                        <div className="space-y-4">
                            {sortedPromotions.map((promo) => {

                                const errorMessage = getPromotionError(
                                    promo,
                                    currentFranchiseId,
                                    OrderItems,
                                    selectedIds
                                );

                                const isUsable = !errorMessage;
                                const isSelected = selectedPromoId === promo.id;
                                const isExpired = new Date(promo.endTime) < new Date();

                                return (
                                    <div
                                        key={promo.id}
                                        onClick={() => {
                                            if (isUsable) {
                                                setSelectedPromoId(promo.id);
                                            }
                                        }}
                                        className={`
                                            relative flex border border-slate-200 border-l-0 rounded-r-md overflow-hidden transition-all duration-200
                                            ${!isUsable
                                                ? 'opacity-60 cursor-not-allowed'
                                                : 'cursor-pointer hover:border-primary/50'
                                            }
                                            ${isSelected && isUsable
                                                ? 'border-primary shadow-md scale-[1.01]'
                                                : ''
                                            }
                                        `}
                                    >

                                        {/* Răng cưa */}
                                        <div className="absolute left-[-7px] top-0 bottom-0 w-3 flex flex-col justify-around z-10">
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className="size-3 bg-white rounded-full border border-slate-200" />
                                            ))}
                                        </div>

                                        {/* Left */}
                                        <div className="w-28 bg-primary/5 border-r border-dashed border-slate-300 flex flex-col items-center justify-center p-3">
                                            <span className="material-symbols-outlined text-primary text-3xl mb-1">
                                                {promo.type === 'PERCENT'
                                                    ? 'percent'
                                                    : 'payments'}
                                            </span>
                                            <span className="text-xs font-medium text-primary uppercase">
                                                Voucher
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-3 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-base font-bold uppercase">
                                                    Giảm{' '}
                                                    {promo.type === 'PERCENT'
                                                        ? `${promo.value}%`
                                                        : `${promo.value.toLocaleString()}₫`}
                                                </h3>

                                                {promo.productFranchiseId ? (
                                                    errorMessage && <p className='text-xs text-charcoal mt-1'>{errorMessage}</p>
                                                ) : (
                                                    <p className='text-xs text-charcoal mt-1'>Áp dụng tất cả các đơn hàng</p>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center mt-1">
                                                <span className={`text-xs font-medium ${isExpired
                                                    ? 'text-gray-400'
                                                    : 'text-red-500'
                                                    }`}>
                                                    {isExpired
                                                        ? 'Đã hết hạn'
                                                        : `HSD: ${new Date(
                                                            promo.endTime
                                                        ).toLocaleDateString(
                                                            'vi-VN'
                                                        )}`}
                                                </span>

                                                <div
                                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                                                        ${!isUsable
                                                            ? 'border-gray-300'
                                                            : isSelected
                                                                ? 'border-primary scale-110'
                                                                : 'border-slate-300'
                                                        }`}
                                                >
                                                    {isUsable && isSelected && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-primary scale-110" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-md border border-slate-300 text-sm font-medium hover:bg-slate-100 transition"
                    >
                        Hủy
                    </button>

                    <button
                        onClick={handleApply}
                        disabled={!selectedPromoId}
                        className="px-6 py-2 rounded-md bg-primary text-white text-sm font-medium hover:opacity-90 disabled:bg-slate-300 transition"
                    >
                        Áp dụng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoucherModal;