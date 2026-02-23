import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductTable from '@components/Client/ProductTable/ProductTable';
import type { ProductItem } from '@/models/product_item';
import ButtonSubmit from '@components/Client/Button/ButtonSubmit';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAtBottom, setIsAtBottom] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // States cho Modal
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal xóa nhiều
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null); // Modal xóa 1 sp
  const [voucherCodeInput, setVoucherCodeInput] = useState('');

  // Dữ liệu giả lập
  const [cartItems, setCartItems] = useState<ProductItem[]>([
    { product_franchise_id: 1, product_name: "Hạt Cà Phê Robusta Honey", price_base: 150000, quantity: 10, category_name: "Cà phê hạt", image_url: "https://via.placeholder.com/80" },
    { product_franchise_id: 2, product_name: "Sữa đặc chuyên dụng Choi", price_base: 600000, quantity: 2, category_name: "Sữa đặc", image_url: "https://via.placeholder.com/80" },
    { product_franchise_id: 3, product_name: "Ly giấy Choi 12oz", price_base: 1200, quantity: 500, category_name: "Bao bì", image_url: "https://via.placeholder.com/80" },
    { product_franchise_id: 4, product_name: "Ống hút giấy phi 6", price_base: 500, quantity: 1000, category_name: "Bao bì", image_url: "https://via.placeholder.com/80" },
  ]);

  const [selectedIds, setSelectedIds] = useState<number[]>(
    cartItems.map(item => item.product_franchise_id)
  );

  // --- LOGIC XỬ LÝ STICKY ---
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsAtBottom(entry.isIntersecting);
    }, { threshold: 0.1 });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  // --- HANDLERS ---
  const toggleSelectItem = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === cartItems.length ? [] : cartItems.map(i => i.product_franchise_id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item =>
      item.product_franchise_id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  // Mở modal xóa 1 sp
  const openDeleteSingleModal = (id: number) => {
    const item = cartItems.find(i => i.product_franchise_id === id);
    if (item) setProductToDelete(item);
  };

  // Xác nhận xóa 1 sp
  const handleConfirmDeleteSingle = () => {
    if (productToDelete) {
      const id = productToDelete.product_franchise_id;
      setCartItems(prev => prev.filter(item => item.product_franchise_id !== id));
      setSelectedIds(prev => prev.filter(i => i !== id));
      setProductToDelete(null);
    }
  };

  // Xác nhận xóa nhiều sp (đã chọn)
  const handleConfirmDeleteMultiple = () => {
    setCartItems(prev => prev.filter(item => !selectedIds.includes(item.product_franchise_id)));
    setSelectedIds([]);
    setShowDeleteModal(false);
  };

  const subtotal = useMemo(() => {
    return cartItems
      .filter(item => selectedIds.includes(item.product_franchise_id))
      .reduce((sum, item) => sum + (item.price_base * item.quantity), 0);
  }, [cartItems, selectedIds]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 relative">
      <div className="mx-auto py-6 md:py-10 px-4">
        {/* Tiêu đề trang */}
        <div className="max-w-[1400px] mx-auto flex items-baseline justify-between mb-8 border-b border-slate-200 pb-2">
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-800">Giỏ hàng</h1>
          <span className="text-sm font-medium text-slate-400 tabular-nums">{cartItems.length} sản phẩm</span>
        </div>

        {cartItems.length > 0 ? (
          <div className="max-w-[1400px] mx-auto flex flex-col">
            <ProductTable
              items={cartItems}
              variant="cart"
              selectedIds={selectedIds}
              onToggleItem={toggleSelectItem}
              onToggleAll={toggleSelectAll}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={openDeleteSingleModal} // Truyền hàm mở modal xóa 1 sp
            />

            <div ref={sentinelRef} className="h-px w-full mt-4" />

            {/* PHẦN THANH TOÁN STICKY */}
            <div className={`transition-all duration-300 ease-in-out left-0 right-0 bg-white ${isAtBottom ? "relative mt-4 border border-slate-200" : "fixed bottom-0 z-40 bg-white shadow-[0_-10px_25px_rgba(0,0,0,0.05)] border-t border-slate-200"}`}>
              {/* Voucher Area */}
              <div className="border-b border-dashed border-slate-200">
                <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-end gap-10">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-lg text-primary">local_activity</span>
                    <span className="hidden sm:inline font-medium">Voucher của ChoiCoffee</span>
                  </div>
                  <button onClick={() => setShowVoucherModal(true)} className="text-sm font-bold text-primary hover:underline">Chọn hoặc nhập mã</button>
                </div>
              </div>

              {/* Main Checkout Area */}
              <div className="max-w-[1400px] mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={selectedIds.length === cartItems.length} onChange={toggleSelectAll} className="appearance-none w-5 h-5 rounded border border-slate-300 checked:bg-primary checked:border-primary relative shrink-0 after:content-[''] after:absolute after:hidden checked:after:block after:left-[6px] after:top-[2px] after:w-[6px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45" />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-primary transition-colors">Chọn tất cả ({cartItems.length})</span>
                  </label>
                  <button onClick={() => setShowDeleteModal(true)} disabled={selectedIds.length === 0} className={`text-sm font-bold text-slate-600 hover:text-red-500 transition-all flex items-center gap-1 ${selectedIds.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <span className="material-symbols-outlined text-lg">delete</span>
                    Xóa ({selectedIds.length})
                  </button>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end leading-tight">
                        <span className="text-sm font-medium text-slate-500">Tổng thanh toán</span>
                        <span className="text-[11px] text-slate-400">({selectedIds.length} sản phẩm)</span>
                      </div>
                      <span className="text-2xl md:text-[26px] font-black text-primary tabular-nums leading-none">₫{subtotal.toLocaleString()}</span>
                    </div>
                  </div>
                  <ButtonSubmit label="Mua hàng" disabled={selectedIds.length === 0} onClick={() => navigate('/client/checkout')} className="!w-full md:!w-[210px] uppercase font-bold tracking-wider !rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center text-center mx-auto border border-slate-100 bg-white rounded-xl shadow-sm">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">shopping_cart_off</span>
            <h3 className="text-lg font-bold text-slate-800">Giỏ hàng đang trống</h3>
            <ButtonSubmit label="Tiếp tục mua sắm" onClick={() => navigate('/menu')} className="!w-auto px-10 border border-slate-200 shadow-none !bg-white !text-slate-700 hover:!bg-slate-50" />
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* 1. Modal Voucher */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-base uppercase tracking-wide text-slate-800">Chọn ChoiCoffee Voucher</h2>
              <button onClick={() => setShowVoucherModal(false)} className="material-symbols-outlined text-slate-400 hover:text-red-500 transition-colors">close</button>
            </div>
            <div className="p-8">
              <div className="flex gap-2 mb-6 bg-white p-2 rounded-lg border border-slate-200 focus-within:border-primary transition-all shadow-sm">
                <input
                  type="text"
                  placeholder="Nhập mã voucher tại đây..."
                  className="flex-1 bg-transparent px-2 outline-none text-sm font-medium uppercase"
                  value={voucherCodeInput}
                  onChange={(e) => setVoucherCodeInput(e.target.value)}
                />
                <button className="bg-primary text-white px-6 py-2 rounded-md font-bold text-xs uppercase hover:opacity-90 disabled:bg-slate-200" disabled={!voucherCodeInput}>Áp dụng</button>
              </div>
              <div className="text-center py-20 border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
                <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">confirmation_number</span>
                <p className="text-slate-400 font-medium text-sm">Kho voucher của chi nhánh đang trống</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Xóa NHIỀU sp */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl text-center animate-in zoom-in fade-in duration-200">
            <div className="size-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl">delete_sweep</span>
            </div>
            <h2 className="font-bold text-base text-slate-800 mb-2">Xóa các mục đã chọn?</h2>
            <p className="text-slate-500 mb-8 leading-relaxed text-sm">
              Bạn có chắc chắn muốn loại bỏ <span className="font-bold text-red-500">{selectedIds.length}</span> sản phẩm này khỏi giỏ hàng không?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 rounded-lg font-bold text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all text-sm">Hủy</button>
              <button onClick={handleConfirmDeleteMultiple} className="flex-1 py-2.5 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all text-sm active:scale-95">Đồng ý xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Xóa 1 sp (SẢN PHẨM RIÊNG LẺ) */}
      {productToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl animate-in zoom-in fade-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="size-24 rounded-xl border border-slate-100 overflow-hidden mb-4 bg-white shadow-sm">
                <img src={productToDelete.image_url} alt="" className="w-full h-full object-cover" />
              </div>
              <h2 className="font-bold text-base mb-1.5 text-slate-800">Xóa sản phẩm?</h2>
              <p className="text-slate-500 mb-8 leading-relaxed text-sm px-2">
                Sản phẩm <span className="font-bold text-slate-800 italic">"{productToDelete.product_name}"</span> sẽ được loại khỏi giỏ hàng của bạn.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setProductToDelete(null)} className="flex-1 py-2.5 rounded-lg font-bold text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all text-sm">Quay lại</button>
              <button onClick={handleConfirmDeleteSingle} className="flex-1 py-2.5 rounded-lg font-bold text-white bg-[#ee4d2d] hover:bg-[#d73211] shadow-lg shadow-red-100 transition-all text-sm active:scale-95">Xác nhận xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;