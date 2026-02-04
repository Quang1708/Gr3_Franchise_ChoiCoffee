import React, { useState, useMemo } from 'react';
import type {ChangeEvent} from 'react';
import type { ICart } from './model/ICart';

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<ICart[]>([
    {
      product_franchise_id: 1,
      SKU: "ROB-HON-001",
      product_name: "Hạt Cà Phê Robusta Honey",
      description: "Gói 1kg - Rang mộc chuyên nghiệp",
      price_base: 150000,
      quantity: 10,
      image_url: "https://via.placeholder.com/80"
    },
    {
      product_franchise_id: 2,
      SKU: "MILK-CHOI-001",
      product_name: "Sữa đặc chuyên dụng Choi",
      description: "Thùng 24 hộp - Độ béo 12%",
      price_base: 600000,
      quantity: 2,
      image_url: "https://via.placeholder.com/80"
    }
  ]);

  const [selectedIds, setSelectedIds] = useState<number[]>(
    cartItems.map(item => item.product_franchise_id)
  );

  const toggleSelectItem = (id: number): void => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (): void => {
    if (selectedIds.length === cartItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cartItems.map(item => item.product_franchise_id));
    }
  };

  const updateQuantity = (id: number, delta: number): void => {
    setCartItems(prev => prev.map(item => {
      if (item.product_franchise_id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const subtotal = useMemo<number>(() => {
    return cartItems
      .filter(item => selectedIds.includes(item.product_franchise_id))
      .reduce((sum, item) => sum + (item.price_base * item.quantity), 0);
  }, [cartItems, selectedIds]);

  const total = subtotal;

  interface CheckboxProps {
    checked: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  }

  const CheckboxGreen: React.FC<CheckboxProps> = ({ checked, onChange }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 rounded border-slate-300 cursor-pointer appearance-none 
                checked:bg-green-500 checked:border-transparent relative
                checked:after:content-['✓'] checked:after:absolute checked:after:text-white 
                checked:after:text-[10px] checked:after:font-black checked:after:left-1/2 
                checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2
                transition-all shrink-0 border"
    />
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 font-display overflow-x-hidden mx-auto px-4 py-6 md:py-10 text-base">
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="mb-6 text-left">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 uppercase tracking-tight">Giỏ hàng nhập hàng</h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="w-full lg:w-2/3 space-y-4">
            <div className="flex flex-col border border-slate-100 rounded-lg shadow-sm bg-white overflow-hidden">

              <div className="hidden md:grid grid-cols-12 bg-white p-4 border-b border-slate-100 font-bold uppercase text-slate-400 text-xs items-center">
                <div className="col-span-5 flex items-center gap-3"><span className="pl-8">Sản phẩm</span></div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-center">Thành tiền</div>
                <div className="col-span-1"></div>
              </div>

              <div className="divide-y divide-slate-50">
                {cartItems.map((item) => (
                  <div key={item.product_franchise_id} className="group p-4 flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 hover:bg-slate-50/50 transition-colors">

                    <div className="col-span-5 flex items-center gap-4">
                      <CheckboxGreen
                        checked={selectedIds.includes(item.product_franchise_id)}
                        onChange={() => toggleSelectItem(item.product_franchise_id)}
                      />
                      <div className="size-16 md:size-20 rounded-md overflow-hidden border border-slate-100 shrink-0 bg-white">
                        <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-800 text-sm md:text-base line-clamp-1 leading-tight">{item.product_name}</h3>
                        <p className="md:hidden text-primary font-bold text-sm mt-1">₫{item.price_base.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="hidden md:block col-span-2 text-center font-medium text-slate-600 tabular-nums">
                      ₫{item.price_base.toLocaleString()}
                    </div>

                    <div className="col-span-2 flex items-center justify-between md:justify-center">
                      <span className="md:hidden text-xs text-slate-400">Số lượng:</span>
                      <div className="flex items-center border border-slate-200 rounded bg-white">
                        <button
                          onClick={() => updateQuantity(item.product_franchise_id, -1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                        >-</button>
                        <span className="w-8 md:w-10 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_franchise_id, 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-primary font-bold cursor-pointer"
                        >+</button>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center justify-between md:justify-center">
                      <span className="md:hidden text-xs text-slate-400">Thành tiền:</span>
                      <div className="font-bold text-slate-800 tabular-nums min-w-[80px] text-right md:text-center">
                        ₫{(item.price_base * item.quantity).toLocaleString()}
                      </div>
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <button className="md:opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-2 transition-all cursor-pointer bg-slate-50 md:bg-transparent rounded-full md:rounded-none">
                        <span className="material-symbols-outlined text-xl">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center text-sm">
                <label className="flex items-center gap-3 cursor-pointer font-medium text-slate-600">
                  <CheckboxGreen
                    checked={selectedIds.length === cartItems.length && cartItems.length > 0}
                    onChange={toggleSelectAll}
                  />
                  Chọn tất cả ({selectedIds.length})
                </label>
                <button className="font-bold text-red-500 uppercase text-[10px] cursor-pointer hover:underline tracking-wider">
                  Dọn dẹp giỏ hàng
                </button>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white border border-slate-100 rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  receipt_long
                </span>
                Thông tin đơn hàng
              </h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-500 items-baseline">
                  <span>Tạm tính ({selectedIds.length} món)</span>
                  <span className="font-bold text-slate-800 tabular-nums min-w-[120px] text-right">
                    ₫{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="pt-4 border-t flex justify-between items-baseline">
                  <span className="font-bold text-slate-700">Tổng thanh toán:</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary leading-none tabular-nums">
                      ₫{total.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 italic">(Giá đã bao gồm VAT nếu có)</p>
                  </div>
                </div>
              </div>
              <button
                className="w-full rounded-xl bg-primary h-12 text-white font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-primary/20 uppercase tracking-widest text-sm"
                disabled={selectedIds.length === 0}
              >
                Tiến hành thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
