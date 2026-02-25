import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductTable from '@components/Client/ProductTable/ProductTable';
import type { ProductItem } from '@/models/product_item';
import ButtonSubmit from '@components/Client/Button/ButtonSubmit';
import VoucherModal from '@/components/Client/Modal/VoucherModal';
import ROUTER_URL from '@/routes/router.const';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAtBottom, setIsAtBottom] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // States cho Modal
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal xóa nhiều
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null); // Modal xóa 1 sp

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
    <div className="bg-slate text-slate pb-20 relative">
      <div className="mx-auto py-6 md:py-10 px-4">
        {/* Tiêu đề trang */}
        <div className="max-w-[1400px] mx-auto flex items-baseline justify-between mb-8 border-b border-slate-200 pb-2">
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-800">Giỏ hàng</h1>
          <span className="text-sm text-slate-400 tabular-nums">{cartItems.length} sản phẩm</span>
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
              onRemoveItem={openDeleteSingleModal}
            />

            <div ref={sentinelRef} className="h-px w-full mt-4" />

            {/* PHẦN THANH TOÁN STICKY */}
            <div className={`transition-all duration-300 ease-in-out left-0 right-0 bg-white ${isAtBottom ? "relative mt-4 border border-slate-200" : "fixed bottom-0 z-40 bg-white shadow-[0_-10px_25px_rgba(0,0,0,0.05)] border-t border-slate-200"}`}>
              {/* Voucher Area */}
              <div className="border-b border-dashed border-slate-200">
                <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-end gap-10">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-lg text-primary">local_activity</span>
                    <span className="hidden sm:inline">Voucher của ChoiCoffee</span>
                  </div>
                  <button onClick={() => setShowVoucherModal(true)} className="text-sm font-bold text-primary hover:underline cursor-pointer">Chọn hoặc nhập mã</button>
                </div>
              </div>

              {/* Main Checkout Area */}
              <div className="max-w-[1400px] mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={selectedIds.length === cartItems.length} onChange={toggleSelectAll} className="appearance-none w-5 h-5 rounded border border-slate-300 checked:bg-primary checked:border-primary relative shrink-0 after:content-[''] after:absolute after:hidden checked:after:block after:left-[6px] after:top-[2px] after:w-[6px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45 cursor-pointer" />
                    <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">Chọn tất cả ({cartItems.length})</span>
                  </label>
                  <button onClick={() => setShowDeleteModal(true)} disabled={selectedIds.length === 0} className={`text-sm text-slate-600 hover:text-red-500 transition-all flex items-center gap-1 cursor-pointer ${selectedIds.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <span className="material-symbols-outlined text-slate-600">delete</span>
                    Xóa ({selectedIds.length})
                  </button>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end leading-tight">
                        <span className="text-sm text-slate-500">Tổng thanh toán</span>
                        <span className="text-[11px] text-slate-400">({selectedIds.length} sản phẩm)</span>
                      </div>
                      <span className="text-2xl md:text-[26px] font-black text-primary tabular-nums leading-none">₫{subtotal.toLocaleString()}</span>
                    </div>
                  </div>
                  <ButtonSubmit
                    label="Mua hàng"
                    disabled={selectedIds.length === 0}
                    onClick={() => {
                      // Lọc ra danh sách các object sản phẩm thực tế từ selectedIds
                      const selectedProducts = cartItems.filter(item =>
                        selectedIds.includes(item.product_franchise_id)
                      );

                      // Chuyển trang và gửi kèm dữ liệu
                      navigate(ROUTER_URL.CLIENT_ROUTER.CHECKOUT, {
                        state: {
                          products: selectedProducts,
                          subtotal: subtotal
                        }
                      });
                    }}
                    className="!w-full md:!w-[210px] uppercase font-bold tracking-wider cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="relative mb-8 flex items-center justify-center">
              <div className="absolute size-48 bg-slate-200/40 rounded-full blur-3xl"></div>
              <div className="relative size-32 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100">
                <span className="material-symbols-outlined text-[70px] text-slate-200">shopping_cart_off</span>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Giỏ hàng của bạn đang trống</h3>
            <p className="text-sm text-slate-400 mb-10 max-w-xs text-center leading-relaxed">
              Hãy thêm những sản phẩm tuyệt vời từ ChoiCoffee để bắt đầu đơn hàng của chi nhánh.
            </p>
            <ButtonSubmit label="Quay lại thực đơn" onClick={() => navigate('/menu')} className="!w-auto px-12 !py-3 shadow-xl shadow-primary/10" />
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {/* 1. Modal Voucher */}
      <VoucherModal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        onApply= {() => {
          alert(`Chức năng này chưa được triển khai`);
          setShowVoucherModal(false);
        }}
      />

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
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 rounded-lg font-bold text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all text-sm cursor-pointer">Hủy</button>
              <button onClick={handleConfirmDeleteMultiple} className="flex-1 py-2.5 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all text-sm active:scale-95 cursor-pointer">Xóa</button>
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
              <button onClick={() => setProductToDelete(null)} className="flex-1 py-2.5 rounded-lg font-bold text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all text-sm cursor-pointer">Quay lại</button>
              <button onClick={handleConfirmDeleteSingle} className="flex-1 py-2.5 rounded-lg font-bold text-white bg-[#ee4d2d] hover:bg-[#d73211] shadow-lg shadow-red-100 transition-all text-sm active:scale-95 cursor-pointer">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;