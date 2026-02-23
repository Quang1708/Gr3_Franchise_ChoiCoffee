import React from 'react';
import type { ProductItem } from '@/models/product_item';

interface ProductTableProps {
    items: ProductItem[];
    selectedIds?: number[];
    onUpdateQuantity?: (id: number, delta: number) => void;
    onToggleItem?: (id: number) => void;
    onToggleAll?: () => void;
    onRemoveItem?: (id: number) => void;
    variant?: 'cart' | 'checkout';
}

const ProductTable: React.FC<ProductTableProps> = ({
    items = [],
    selectedIds = [],
    onUpdateQuantity,
    onToggleItem,
    onToggleAll,
    onRemoveItem,
    variant = 'cart'
}) => {
    const isCheckout = variant === 'checkout';

    // Tailwind Class cho Custom Checkbox (Dấu tick trắng)
    const checkboxClass = `
        appearance-none w-5 h-5 rounded border border-slate-300 
        cursor-pointer transition-all relative shrink-0
        checked:bg-primary checked:border-primary
        after:content-[''] after:absolute after:hidden checked:after:block
        after:left-[6px] after:top-[2px] after:w-[6px] after:h-[10px] 
        after:border-white after:border-r-2 after:border-b-2 after:rotate-45
    `;

    return (
        <div className={`flex flex-col bg-white overflow-hidden border border-slate-200`}>
            <div className="hidden md:grid grid-cols-12 p-5 border-b border-slate-200 font-bold text-[14px] items-center">
                <div className={`${isCheckout ? 'col-span-5' : 'col-span-4'} flex items-center gap-3`}>
                    {!isCheckout && onToggleAll && (
                        <input
                            type="checkbox"
                            checked={items.length > 0 && selectedIds.length === items.length}
                            onChange={onToggleAll}
                            className={checkboxClass}
                        />
                    )}
                    <span className={!isCheckout ? "pl-2" : "pl-4"}>Sản phẩm</span>
                </div>
                <div className="col-span-2 text-center">Phân loại</div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className={`${isCheckout ? 'col-span-3 text-right pr-6' : 'col-span-1 text-center'}`}>Tổng</div>
                {!isCheckout && <div className="col-span-1"></div>}
            </div>

            {/* Body */}
            <div className="divide-y divide-slate-100">
                {items.map((item) => (
                    <div key={item.product_franchise_id} className="relative p-4 md:p-5 flex flex-row items-center md:grid md:grid-cols-12 gap-4 hover:bg-slate-50/30 transition-all">

                        {/* 1. Thông tin sản phẩm */}
                        <div className={`${isCheckout ? 'col-span-5' : 'col-span-4'} flex items-center gap-4 flex-1 md:flex-none min-w-0`}>
                            {!isCheckout && onToggleItem && (
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(item.product_franchise_id)}
                                    onChange={() => onToggleItem(item.product_franchise_id)}
                                    className={checkboxClass}
                                />
                            )}
                            <div className="size-16 md:size-20 rounded-lg overflow-hidden border border-slate-100 shrink-0 bg-white">
                                <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-medium text-slate-800 text-[14px] line-clamp-1 leading-tight capitalize">
                                    {item.product_name}
                                </h3>
                            </div>
                        </div>

                        {/* 2. Phân loại */}
                        <div className="hidden sm:flex col-span-2 justify-center">
                            <span className="text-center text-[14px] font-medium text-slate-500 whitespace-nowrap px-2 py-0.5 rounded border-slate-100">
                                {item.category_name || 'Chưa phân loại'}
                            </span>
                        </div>

                        {/* 3. Đơn giá */}
                        <div className="hidden md:block col-span-2 text-center text-[14px] font-medium text-slate-500 tabular-nums">
                            ₫{item.price_base.toLocaleString()}
                        </div>

                        {/* 4. Số lượng */}
                        <div className="col-span-2 flex items-center justify-center shrink-0">
                            {isCheckout ? (
                                <span className="font-bold text-slate-800 text-[14px]">x{item.quantity}</span>
                            ) : (
                                <div className="flex items-center border border-slate-200 bg-white overflow-hidden scale-90 md:scale-100">
                                    <button 
                                        onClick={() => onUpdateQuantity?.(item.product_franchise_id, -1)} 
                                        disabled={item.quantity <= 1}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-400 disabled:opacity-30 transition-colors"
                                    >-</button>
                                    <span className="w-8 text-center text-[14px] text-slate-800 tabular-nums">{item.quantity}</span>
                                    <button 
                                        onClick={() => onUpdateQuantity?.(item.product_franchise_id, 1)} 
                                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-primary font-bold transition-colors"
                                    >+</button>
                                </div>
                            )}
                        </div>

                        {/* 5. Thành tiền */}
                        <div className={`${isCheckout ? 'col-span-3 text-right pr-2' : 'col-span-1 text-center'} hidden sm:block font-bold text-slate-800 text-[14px] tabular-nums shrink-0`}>
                            ₫{(item.price_base * item.quantity).toLocaleString()}
                        </div>

                        {/* 6. Nút xóa */}
                        {!isCheckout && (
                            <div className="md:col-span-1 flex justify-end shrink-0">
                                <button
                                    onClick={() => onRemoveItem?.(item.product_franchise_id)}
                                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductTable;