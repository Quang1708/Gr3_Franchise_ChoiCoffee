import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductTable from '@components/Client/ProductTable/ProductTable';
import ButtonSubmit from '@components/Client/Button/ButtonSubmit';
import VoucherModal from '@/components/Client/Modal/VoucherModal';
import ROUTER_URL from '@/routes/router.const';
import { PROMOTION_SEED_DATA } from '@/mocks/promotion.seed';
import type { Promotion } from '@/models/promotion.model';
import type { OrderItem } from '@/models/order_item.model';
import { ORDER_ITEM_SEED_DATA } from '@/mocks/order_item.seed';

const CheckoutPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // 1. STATE THÔNG TIN NGƯỜI NHẬN
    const [isEditing, setIsEditing] = useState(false);
    const [recipient, setRecipient] = useState({
        name: 'Trần Thị Huyền Trân',
        phone: '0911 222 333',
        address: '97 Man Thiện, Phường Hiệp Phú, Quận 9, TP. Hồ Chí Minh'
    });
    const [tempRecipient, setTempRecipient] = useState({ ...recipient });

    // 2. STATE VẬN CHUYỂN & THANH TOÁN
    const [shippingMethod, setShippingMethod] = useState('fast');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [showShippingModal, setShowShippingModal] = useState(false);

    const [orderItems, setOrderItem] = useState<OrderItem[]>(ORDER_ITEM_SEED_DATA);

    const [selectedIds, setSelectedIds] = useState<number[]>(
        orderItems.map(item => item.productFranchiseId)
    );

    const currentFranchiseId = Number(localStorage.getItem("selectedFranchise")) || 1;

    const { products, subtotal } = location.state || {};

    const shippingOptions = [
        { id: 'fast', label: 'Hỏa tốc nội bộ', time: '2-4 giờ', price: 0 },
        { id: 'standard', label: 'Giao hàng nhanh', time: '1-2 ngày', price: 15000 },
        { id: 'economy', label: 'Tiết kiệm', time: '3-5 ngày', price: 30000 },
    ];

    const currentShippingPrice = useMemo(() => {
        return shippingOptions.find(opt => opt.id === shippingMethod)?.price || 0;
    }, [shippingMethod]);

    const discountAmount = useMemo(() => {
        if (!selectedPromotion || !subtotal) return 0;

        // Nếu voucher áp dụng cho sản phẩm cụ thể
        if (selectedPromotion.productFranchiseId) {
            const hasValidProduct = products?.some(
                (p: any) =>
                    p.product_franchise_id === selectedPromotion.productFranchiseId
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
    }, [selectedPromotion, subtotal, products]);

    const finalTotal = useMemo(() => {
        return (subtotal || 0) - discountAmount + currentShippingPrice;
    }, [subtotal, discountAmount, currentShippingPrice]);

    useEffect(() => {
        if (!products || products.length === 0) {
            navigate('/client/cart');
        }
    }, [products, navigate]);

    const handleSaveInfo = () => {
        setRecipient({ ...tempRecipient });
        setIsEditing(false);
    };

    if (!products) return null;

    return (
        <div className="pb-10 relative">
            <div className="max-w-[1400px] mx-auto py-3 md:py-5 px-4 flex flex-col gap-4">
                <div className="flex items-center gap-1 mb-2 border-b border-slate-200">
                    <button onClick={() => navigate(-1)} className="material-symbols-outlined cursor-pointer text-charcoal-400 hover:text-primary p-1">
                        arrow_back
                    </button>
                    <h1 className="text-xl font-bold uppercase tracking-tight text-charcoal-800">Thanh toán</h1>
                </div>

                <div className="bg-white border border-slate-200 rounded-md overflow-hidden border-t-4 border-t-primary">
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-primary text-base font-medium uppercase">
                                <span className="material-symbols-outlined text-xl">location_on</span>
                                Địa chỉ nhận hàng
                            </div>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="text-primary text-[14px] hover:underline cursor-pointer">Chỉnh sửa</button>
                            ) : (
                                <div className="flex gap-4">
                                    <button onClick={() => setIsEditing(false)} className="text-charcoal-400 text-[14px] hover:underline cursor-pointer">Hủy</button>
                                    <button onClick={handleSaveInfo} className="text-primary text-[14px] hover:underline cursor-pointer">Lưu thông tin</button>
                                </div>
                            )}
                        </div>

                        {!isEditing ? (
                            <div className="flex items-baseline gap-4">
                                <span className="text-charcoal font-medium shrink-0">{recipient.name} | {recipient.phone}</span>
                                <span className="text-base text-charcoal italic truncate">{recipient.address}</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
                                <div className="space-y-1">
                                    <label className="text-[14px] text-charcoal font-medium ml-1">Họ và tên</label>
                                    <input type="text" value={tempRecipient.name} onChange={(e) => setTempRecipient({ ...tempRecipient, name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-base focus:border-primary outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[14px] text-charcoal font-medium ml-1">Số điện thoại</label>
                                    <input type="text" value={tempRecipient.phone} onChange={(e) => setTempRecipient({ ...tempRecipient, phone: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-base focus:border-primary outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[14px] text-charcoal font-medium ml-1">Địa chỉ chi tiết</label>
                                    <input type="text" value={tempRecipient.address} onChange={(e) => setTempRecipient({ ...tempRecipient, address: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-base focus:border-primary outline-none" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white overflow-hidden">
                    <ProductTable items={products} variant="checkout" />
                </div>

                {/* 2. HÌNH THỨC VẬN CHUYỂN - NGANG 1 HÀNG */}
                <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-row items-center justify-between gap-4">
                    <div className="flex flex-row items-center gap-2 flex-1 min-w-0">
                        <div className="flex items-center justify-center gap-2 shrink-0">
                            <span className="material-symbols-outlined text-teal-600 text-xl">local_shipping</span>
                            <h2 className="text-base text-charcoal font-medium whitespace-nowrap">
                                Phương thức vận chuyển:
                            </h2>
                        </div>

                        <div className="truncate">
                            <span className="text-base text-charcoal">
                                {shippingOptions.find(opt => opt.id === shippingMethod)?.label}
                            </span>
                            <span className="hidden md:inline-block ml-2 text-[14px] text-charcoal-400 italic">
                                (Dự kiến: {shippingOptions.find(opt => opt.id === shippingMethod)?.time})
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                        <span className="text-base text-charcoal tabular-nums">
                            {currentShippingPrice === 0 ? 'Miễn phí' : `₫${currentShippingPrice.toLocaleString()}`}
                        </span>
                        <button
                            onClick={() => setShowShippingModal(true)}
                            className=" text-primary text-[14px] hover:underline cursor-pointer border-l border-slate-200 pl-6 h-6 flex items-center"
                        >
                            Thay đổi
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-row items-center justify-between gap-6">
                    <div className="flex items-center justify-center gap-2 shrink-0">
                        <span className="material-symbols-outlined text-primary text-lg">payments</span>
                        <h2 className="text-base text-charcoal font-medium whitespace-nowrap">
                            Phương thức thanh toán
                        </h2>
                    </div>

                    <div className="flex flex-row gap-3 overflow-x-auto py-1 scrollbar-hide flex-1 justify-end">
                        {[
                            { id: 'CASH', label: 'Tiền mặt', icon: 'payments', color: 'text-amber-500' },
                            { id: 'CARD', label: 'Thẻ ATM', icon: 'credit_card', color: 'text-blue-500' },
                            { id: 'MOMO', label: 'Ví Momo', icon: 'account_balance_wallet', color: 'text-[#A50064]' },
                            { id: 'VNPAY', label: 'VNPAY', icon: 'qr_code_scanner', color: 'text-[#005BAA]' },
                        ].map((pm) => (
                            <label
                                key={pm.id}
                                className={`flex items-center gap-2 p-2.5 px-4 border cursor-pointer transition-all rounded-lg shrink-0
                                    ${paymentMethod === pm.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                            >
                                <div className="relative flex items-center justify-center shrink-0">
                                    <input type="radio" name="payment" checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} className="appearance-none size-4 rounded-full border-2 border-slate-300 checked:border-primary cursor-pointer" />
                                    {paymentMethod === pm.id && <div className="absolute size-2 bg-primary rounded-full animate-in zoom-in duration-200"></div>}
                                </div>
                                <div className={`size-7 rounded-full bg-slate-50 flex items-center justify-center shrink-0 ${pm.color}`}>
                                    <span className="material-symbols-outlined text-base">{pm.icon}</span>
                                </div>
                                <span className="text-[14px] text-charcoal whitespace-nowrap">{pm.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-row items-center justify-between gap-6">
                    <div className="flex items-center justify-center gap-2 shrink-0">
                        <span className="material-symbols-outlined text-primary text-lg">local_activity</span>
                        <h2 className="text-base text-charcoal font-medium whitespace-nowrap">
                            Voucher của ChoiCoffee
                        </h2>
                    </div>

                    <div className="flex flex-col items-end">
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

                <div className="bg-white border border-slate-200 rounded-md p-8 flex flex-col items-end">
                    <div className="w-full max-w-sm space-y-3">
                        <div className="flex justify-between text-base text-charcoal ">
                            <span>Tạm tính ({products.length} món)</span>
                            <span className="text-charcoal tracking-tight">₫{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-base text-charcoal ">
                            <span>
                                Phí giao hàng ({shippingOptions.find(opt => opt.id === shippingMethod)?.label})
                            </span>

                            <span className="text-teal-600 uppercase text-sm">
                                {currentShippingPrice === 0
                                    ? 'Miễn phí'
                                    : `+ ₫${currentShippingPrice.toLocaleString()}`
                                }
                            </span>
                        </div>
                        <div className="flex justify-between text-base text-charcoal  border-b border-slate-100 pb-3">
                            <span>Giảm giá Voucher</span>
                            <span className="text-red-500 font-bold">
                                {discountAmount > 0
                                    ? `-₫${discountAmount.toLocaleString()}`
                                    : '-₫0'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-4">
                            <span className="font-black text-charcoal uppercase text-base">Tổng thanh toán</span>
                            <span className="text-[24px] font-black text-primary tabular-nums tracking-tighter">₫{finalTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="w-full max-w-sm pt-10">
                        <ButtonSubmit
                            label={isLoading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                            disabled={isLoading}
                            onClick={() => {
                                setIsLoading(true);

                                setTimeout(() => {
                                    setIsLoading(false);
                                    navigate(`${ROUTER_URL.CLIENT_ROUTER.PAYMENT_STATUS}?success=true`);
                                }, 2000);
                            }}
                        />
                    </div>
                    <p className="w-full max-w-sm text-center text-sm italic text-charcoal-400 mt-4">
                        Kiểm tra kỹ thông tin trước khi xác nhận
                    </p>
                </div>
            </div>

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

            {/* --- SHIPPING MODAL (TÍCH HỢP TRONG PAGE) --- */}
            {showShippingModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-none shadow-2xl overflow-hidden animate-in zoom-in duration-150">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="font-black text-base uppercase tracking-widest text-charcoal">Chọn vận chuyển</h2>
                            <button onClick={() => setShowShippingModal(false)} className="material-symbols-outlined text-charcoal-400 hover:text-red-500 cursor-pointer">close</button>
                        </div>

                        <div className="p-4 flex flex-col gap-2">
                            {shippingOptions.map((method) => (
                                <label
                                    key={method.id}
                                    className={`flex items-center justify-between p-4 border cursor-pointer transition-all rounded-lg
                        ${shippingMethod === method.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-100 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative flex items-center justify-center shrink-0">
                                            <input
                                                type="radio"
                                                name="shipping_inline"
                                                checked={shippingMethod === method.id}
                                                onChange={() => {
                                                    setShippingMethod(method.id);
                                                    setShowShippingModal(false);
                                                }}
                                                className="appearance-none size-5 rounded-full border-2 border-slate-300 checked:border-primary transition-all cursor-pointer"
                                            />
                                            {shippingMethod === method.id && (
                                                <div className="absolute size-2.5 bg-primary rounded-full"></div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-charcoal">{method.label}</p>
                                            <p className="text-sm text-charcoal-400 italic">Dự kiến: {method.time}</p>
                                        </div>
                                    </div>
                                    <span className="text-base font-black text-primary">
                                        {method.price === 0 ? 'Free' : `₫${method.price.toLocaleString()}`}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;