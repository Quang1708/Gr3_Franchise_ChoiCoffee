import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductTable from '@components/Client/ProductTable/ProductTable';
import ButtonSubmit from '@components/Client/Button/ButtonSubmit';
import VoucherModal from '@/components/Client/Modal/VoucherModal';
import ROUTER_URL from '@/routes/router.const';
import { PROMOTION_SEED_DATA } from '@/mocks/promotion.seed';
import type { Promotion } from '@/models/promotion.model';
import { ORDER_ITEM_SEED_DATA } from '@/mocks/order_item.seed';
import type { OrderItem } from '@/models/order_item.model';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAtBottom, setIsAtBottom] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  // States cho Modal
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal xóa nhiều
  const [productToDelete, setProductToDelete] = useState<OrderItem | null>(null); // Modal xóa 1 sp

  const [orderItems, setOrderItem] = useState<OrderItem[]>(ORDER_ITEM_SEED_DATA);

  const [selectedIds, setSelectedIds] = useState<number[]>(
    orderItems.map(item => item.productFranchiseId)
  );

  const currentFranchiseId = Number(localStorage.getItem("selectedFranchise")) || 1;

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
    setSelectedIds(selectedIds.length === orderItems.length ? [] : orderItems.map(i => i.productFranchiseId));
  };

  const updateQuantity = (id: number, delta: number) => {
    setOrderItem(prev => prev.map(item =>
      item.productFranchiseId === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  // Mở modal xóa 1 sp
  const openDeleteSingleModal = (id: number) => {
    const item = orderItems.find(i => i.productFranchiseId === id);
    if (item) setProductToDelete(item);
  };

  // Xác nhận xóa 1 sp
  const handleConfirmDeleteSingle = () => {
    if (productToDelete) {
      const id = productToDelete.productFranchiseId;
      setOrderItem(prev => prev.filter(item => item.productFranchiseId !== id));
      setSelectedIds(prev => prev.filter(i => i !== id));
      setProductToDelete(null);
    }
  };

  // Xác nhận xóa nhiều sp (đã chọn)
  const handleConfirmDeleteMultiple = () => {
    setOrderItem(prev => prev.filter(item => !selectedIds.includes(item.productFranchiseId)));
    setSelectedIds([]);
    setShowDeleteModal(false);
  };

  const subtotal = useMemo(() => {
    return orderItems
      .filter(item => selectedIds.includes(item.productFranchiseId))
      .reduce((sum, item) => sum + (item.priceSnapshot * item.quantity), 0);
  }, [orderItems, selectedIds]);

  const discountAmount = useMemo(() => {
    if (!selectedPromotion) return 0;

    // nếu áp dụng cho sản phẩm cụ thể
    if (selectedPromotion.productFranchiseId) {
      const hasValidProduct = orderItems.some(
        item =>
          selectedIds.includes(item.productFranchiseId) &&
          item.productFranchiseId === selectedPromotion.productFranchiseId
      );

      if (!hasValidProduct) return 0;
    }

    if (selectedPromotion.type === 'PERCENT') {
      return Math.min(
        (subtotal * selectedPromotion.value) / 100,
        subtotal
      );
    }

    return Math.min(selectedPromotion.value, subtotal);
  }, [selectedPromotion, subtotal, orderItems, selectedIds]);

  const finalTotal = subtotal - discountAmount;
  useEffect(() => {
    if (!selectedPromotion) return;

    // Nếu voucher áp dụng cho sản phẩm cụ thể
    if (selectedPromotion.productFranchiseId) {
      const stillValid = orderItems.some(
        item =>
          selectedIds.includes(item.productFranchiseId) &&
          item.productFranchiseId === selectedPromotion.productFranchiseId
      );

      if (!stillValid) {
        setSelectedPromotion(null);
      }
    }
  }, [orderItems, selectedIds, selectedPromotion]);

  return (
    <div className="pb-10 relative">
      <div className="max-w-[1400px] mx-auto py-3 md:py-5 px-4 flex flex-col gap-4">
        <div className="flex items-baseline justify-between mb-8 border-b border-slate-200">
          <h1 className="text-xl font-bold uppercase tracking-tight text-charcoal-800">Giỏ hàng</h1>
          <span className="text-[14px] text-charcoal-400 tabular-nums">{orderItems.length} sản phẩm</span>
        </div>

        {orderItems.length > 0 ? (
          <div className="flex flex-col">
            <ProductTable
              items={orderItems}
              variant="cart"
              selectedIds={selectedIds}
              onToggleItem={toggleSelectItem}
              onToggleAll={toggleSelectAll}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={openDeleteSingleModal}
            />

            <div ref={sentinelRef} className="h-px w-full" />

            {/* PHẦN THANH TOÁN STICKY */}
            <div className={`transition-all duration-300 ease-in-out left-0 right-0 bg-white 
              ${isAtBottom ? "relative mt-4 border border-slate-200" : "fixed bottom-0 z-40 bg-white shadow-[0_-10px_25px_rgba(0,0,0,0.05)] border-t border-slate-200"} rounded-md`}>
              <div className="border-b border-dashed border-slate-200">
                <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-end gap-10">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-lg text-primary">local_activity</span>
                    <span className="hidden sm:inline text-base">Voucher của ChoiCoffee</span>
                  </div>
                  <button
                    onClick={() => setShowVoucherModal(true)}
                    className="text-base font-medium text-primary hover:underline flex items-center gap-2 cursor-pointer"
                  >
                    {selectedPromotion ? (
                      <span>
                        Giảm {selectedPromotion.type === 'PERCENT'
                          ? `${selectedPromotion.value}%`
                          : `${selectedPromotion.value.toLocaleString()}₫`
                        }
                      </span>
                    ) : (
                      "Chọn hoặc nhập mã"
                    )}
                  </button>
                </div>
              </div>

              <div className="max-w-[1400px] mx-auto px-4 py-4 md:py-6 ml-5 mr-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={selectedIds.length === orderItems.length} onChange={toggleSelectAll} className="appearance-none w-5 h-5 rounded border border-slate-300 checked:bg-primary checked:border-primary relative shrink-0 after:content-[''] after:absolute after:hidden checked:after:block after:left-[6px] after:top-[2px] after:w-[6px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45 cursor-pointer" />
                    <span className="text-base text-charcoal group-hover:text-primary transition-colors">Chọn tất cả ({orderItems.length})</span>
                  </label>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={selectedIds.length === 0}
                    className={`text-sm text-charcoal hover:text-red-500 transition-all flex items-center gap-1 cursor-pointer ${selectedIds.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <span className="material-symbols-outlined text-charcoal font-light hover:text-red-500">delete</span>
                    Xóa ({selectedIds.length})
                  </button>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end leading-tight">
                        <span className="text-base text-charcoal">Tổng thanh toán</span>
                        <span className="text-[14px] text-charcoal">({selectedIds.length} sản phẩm)</span>
                      </div>
                      <span className="text-2xl md:text-[26px] font-bold text-primary tabular-nums leading-none">
                        <div className="flex flex-col items-end">
                          {discountAmount > 0 && (
                            <span className="text-sm text-slate-400 line-through">
                              {subtotal.toLocaleString()}₫
                            </span>
                          )}
                          <span className="text-2xl md:text-[26px] font-bold text-primary tabular-nums">
                            {finalTotal.toLocaleString()}
                            <span className="text-xl align-super">₫</span>
                          </span>
                        </div>
                      </span>
                    </div>
                  </div>
                  <ButtonSubmit
                    label="Mua hàng"
                    disabled={selectedIds.length === 0}
                    onClick={() => {
                      const selectedProducts = orderItems.filter(item =>
                        selectedIds.includes(item.productFranchiseId)
                      );

                      navigate(ROUTER_URL.CLIENT_ROUTER.CHECKOUT, {
                        state: {
                          products: selectedProducts,
                          subtotal: subtotal,
                          promotion: selectedPromotion
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
              <div className="relative flex items-center justify-center">
                <span className="material-symbols-outlined text-charcoal font-light">shopping_cart_off</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-charcoal font-bold mb-2">Giỏ hàng của bạn đang trống</h3>
            <p className="text-[14px] text-charcoal mb-10 max-w-xs text-center leading-relaxed">
              Hãy thêm những sản phẩm tuyệt vời từ ChoiCoffee để bắt đầu đơn hàng của chi nhánh.
            </p>
            <ButtonSubmit label="Quay lại thực đơn"
              onClick={() => navigate(ROUTER_URL.MENU)}
              className="!w-auto px-12 !py-3 shadow-xl shadow-primary/10" />
          </div>
        )}
      </div>

      {/* Modal Voucher */}
      <VoucherModal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        onApply={(promotion) => setSelectedPromotion(promotion)}
        promotions={PROMOTION_SEED_DATA}
        OrderItems={orderItems}
        selectedIds={selectedIds}
        currentFranchiseId={currentFranchiseId}
        selectedPromotion={selectedPromotion}
      />

      {/* MODAL XÁC NHẬN XÓA */}
      {(showDeleteModal || productToDelete) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl animate-in zoom-in fade-in duration-200">
            <div className="flex flex-col items-center text-center">

              <div className="size-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-2xl">
                  {productToDelete ? 'delete' : 'delete_sweep'}
                </span>
              </div>

              <h2 className="font-bold text-xl text-charcoal mb-2">
                {productToDelete ? 'Xóa sản phẩm?' : 'Xóa các mục đã chọn?'}
              </h2>

              <p className="text-charcoal-500 mb-8 leading-relaxed text-[14px] px-2">
                {productToDelete ? (
                  <>
                    Sản phẩm <span className="font-medium text-charcoal italic">"{productToDelete.productNameSnapshot}"</span> sẽ được loại khỏi giỏ hàng của bạn.
                  </>
                ) : (
                  <>
                    Bạn có chắc chắn muốn loại bỏ <span className="font-medium text-red-500">{selectedIds.length}</span> sản phẩm này khỏi giỏ hàng không?
                  </>
                )}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-lg font-medium text-charcoal bg-slate-100 hover:bg-slate-200 transition-all text-[14px] cursor-pointer"
              >
                {productToDelete ? 'Quay lại' : 'Hủy'}
              </button>
              <button
                onClick={productToDelete ? handleConfirmDeleteSingle : handleConfirmDeleteMultiple}
                className="flex-1 py-2.5 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all text-[14px] active:scale-95 cursor-pointer"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;