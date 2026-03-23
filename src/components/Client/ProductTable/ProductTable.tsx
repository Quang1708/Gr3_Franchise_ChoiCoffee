import React from "react";
import type { OrderItem } from "@/models/order_item.model";

interface ProductTableProps {
  items: OrderItem[];
  selectedIds?: number[];
  onUpdateQuantity?: (id: number, delta: number) => void;
  onToggleItem?: (id: number) => void;
  onToggleAll?: () => void;
  onRemoveItem?: (id: number) => void;
  variant?: "cart" | "checkout";
}

const ProductTable: React.FC<ProductTableProps> = ({
  items = [],
  selectedIds = [],
  onUpdateQuantity,
  onToggleItem,
  onToggleAll,
  onRemoveItem,
  variant = "cart",
}) => {
  const isCheckout = variant === "checkout";
  const canSelect = !isCheckout && Boolean(onToggleAll);

  const checkboxClass = `
        appearance-none w-5 h-5 rounded border border-slate-300 
        cursor-pointer transition-all relative shrink-0
        checked:bg-primary checked:border-primary
        after:content-[''] after:absolute after:hidden checked:after:block
        after:left-[6px] after:top-[2px] after:w-[6px] after:h-[10px] 
        after:border-white after:border-r-2 after:border-b-2 after:rotate-45
    `;

  return (
    <div
      className={`flex flex-col bg-white overflow-hidden border border-slate-200 rounded-md`}
    >
      <div className="hidden md:grid grid-cols-10 p-4 border-b border-slate-200 font-bold text-base items-center text-charcoal">
        <div className="col-span-4 flex items-center gap-3">
          {canSelect && (
            <input
              type="checkbox"
              checked={items.length > 0 && selectedIds.length === items.length}
              onChange={onToggleAll}
              className={checkboxClass}
            />
          )}
          <span className={canSelect ? "pl-2" : "pl-0"}>Sản phẩm</span>
        </div>
        {/* <div className="col-span-2 text-center">Phân loại</div> */}
        <div className="col-span-1 text-center">Đơn giá</div>
        <div className="col-span-2 text-center">Số lượng</div>
        <div className="col-span-2 text-center">Tổng</div>
        <div className="col-span-1"></div>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item) => {
          const unitPrice =
            item.quantity > 0
              ? Math.round(item.lineTotal / item.quantity)
              : item.priceSnapshot;

          return (
            <div
              key={item.productFranchiseId}
              className="relative p-4 md:p-4 flex flex-row items-center md:grid md:grid-cols-10 gap-4 hover:bg-slate-50/30 transition-all"
            >
              {/* 1. Thông tin sản phẩm */}
              <div className="col-span-4 flex items-center gap-4 flex-1 md:flex-none min-w-0">
                {canSelect && onToggleItem && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.productFranchiseId)}
                    onChange={() => onToggleItem(item.productFranchiseId)}
                    className={checkboxClass}
                  />
                )}
                <div className="size-16 md:size-20 rounded-lg overflow-hidden border border-slate-100 shrink-0 bg-white">
                  <img
                    src={
                      item.productImageUrl ||
                      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=300&q=80"
                    }
                    alt={item.productNameSnapshot}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-slate-800 text-base line-clamp-2 leading-tight capitalize">
                    {item.productNameSnapshot}
                  </h3>
                  {item.options && item.options.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {item.options.map((option, index) => (
                        <p
                          key={`${item.productFranchiseId}-${option.productFranchiseRawId || index}`}
                          className="text-xs text-slate-500"
                        >
                          + {option.productNameSnapshot} x{option.quantity} (
                          {(
                            option.finalPrice * option.quantity
                          ).toLocaleString()}
                          đ)
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Phân loại */}
              {/* <div className="hidden sm:flex col-span-2 justify-center">
                            <span className="text-center text-base text-charcoal">
                                {item.category_name || 'Chưa phân loại'}
                            </span>
                        </div> */}

              {/* 3. Đơn giá */}
              <div className="hidden md:block col-span-1 text-center text-base text-charcoal tabular-nums">
                {unitPrice.toLocaleString()}
              </div>

              {/* 4. Số lượng */}
              <div className="col-span-2 flex items-center justify-center shrink-0">
                {isCheckout ? (
                  <span className="text-charcoal text-base">
                    x{item.quantity}
                  </span>
                ) : (
                  <div className="flex items-center border border-slate-200 bg-white overflow-hidden rounded-md">
                    <button
                      onClick={() =>
                        onUpdateQuantity?.(item.productFranchiseId, -1)
                      }
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center border-r border-r-slate-200 hover:bg-slate-100 text-charcoal disabled:opacity-30 transition-colors cursor-pointer font-bold"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-base text-charcoal tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        onUpdateQuantity?.(item.productFranchiseId, 1)
                      }
                      className="w-8 h-8 flex items-center justify-center border-l border-l-slate-200 hover:bg-slate-100 text-primary font-bold transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              {/* 5. Thành tiền */}
              <div className="col-span-2 flex items-center justify-center shrink-0 text-base text-charcoal font-medium tabular-nums">
                {item.lineTotal.toLocaleString()}
              </div>

              {/* 6. Nút xóa (Ẩn khi là checkout nhưng vẫn giữ cột để không lệch layout) */}
              <div className="col-span-1 flex justify-end shrink-0 ">
                {!isCheckout && (
                  <button
                    onClick={() => onRemoveItem?.(item.productFranchiseId)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">
                      close
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductTable;
