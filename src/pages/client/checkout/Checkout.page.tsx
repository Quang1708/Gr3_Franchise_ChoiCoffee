import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductTable from '@components/Client/ProductTable/ProductTable';
import ButtonSubmit from '@components/Client/Button/ButtonSubmit';
import VoucherModal from '@/components/Client/Modal/VoucherModal';

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
    const [voucherCode, setVoucherCode] = useState('');
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [showShippingModal, setShowShippingModal] = useState(false);

    const { products, subtotal } = location.state || {};

    const shippingOptions = [
        { id: 'fast', label: 'Hỏa tốc nội bộ', time: '2-4 giờ', price: 0 },
        { id: 'standard', label: 'Giao hàng nhanh', time: '1-2 ngày', price: 15000 },
        { id: 'economy', label: 'Tiết kiệm', time: '3-5 ngày', price: 30000 },
    ];

    const currentShippingPrice = useMemo(() => {
        return shippingOptions.find(opt => opt.id === shippingMethod)?.price || 0;
    }, [shippingMethod]);

    const finalTotal = useMemo(() => {
        return (subtotal || 0) + currentShippingPrice;
    }, [subtotal, currentShippingPrice]);

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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
            <div className="max-w-[1400px] mx-auto py-6 px-4 flex flex-col gap-3">
                <div className="flex items-center gap-4 border-b border-slate-200 pb-4 mb-2">
                    <button onClick={() => navigate(-1)} className="material-symbols-outlined cursor-pointer text-slate-400 hover:text-primary p-1">
                        arrow_back
                    </button>
                    <h1 className="text-xl font-black uppercase tracking-tight text-slate-800">Thanh toán</h1>
                </div>

                <div className="bg-white border border-slate-200 overflow-hidden">
                    <div className="h-0.5 w-full bg-primary"></div>
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-primary font-bold text-[14px] uppercase">
                                <span className="material-symbols-outlined text-xl">location_on</span>
                                Địa chỉ nhận hàng
                            </div>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="text-primary text-sm hover:underline cursor-pointer">Chỉnh sửa</button>
                            ) : (
                                <div className="flex gap-4">
                                    <button onClick={() => setIsEditing(false)} className="text-slate-400 text-sm cursor-pointer">Hủy</button>
                                    <button onClick={handleSaveInfo} className="text-primary text-sm cursor-pointer">Lưu thông tin</button>
                                </div>
                            )}
                        </div>

                        {!isEditing ? (
                            <div className="flex items-baseline gap-4">
                                <span className="font-bold text-slate-800 shrink-0">{recipient.name} | {recipient.phone}</span>
                                <span className="text-[14px] text-slate-500 italic truncate">{recipient.address}</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
                                <div className="space-y-1">
                                    <label className="text-sm text-slate-400 ml-1">Họ và tên</label>
                                    <input type="text" value={tempRecipient.name} onChange={(e) => setTempRecipient({ ...tempRecipient, name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:border-primary outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-slate-400 ml-1">Số điện thoại</label>
                                    <input type="text" value={tempRecipient.phone} onChange={(e) => setTempRecipient({ ...tempRecipient, phone: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:border-primary outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-slate-400 ml-1">Địa chỉ chi tiết</label>
                                    <input type="text" value={tempRecipient.address} onChange={(e) => setTempRecipient({ ...tempRecipient, address: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:border-primary outline-none" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white overflow-hidden">
                    <ProductTable items={products} variant="checkout" />
                </div>

                {/* 2. HÌNH THỨC VẬN CHUYỂN - NGANG 1 HÀNG */}
                <div className="bg-white border border-slate-200 rounded-none p-4 flex flex-row items-center justify-between gap-4">
                    <div className="flex flex-row items-center gap-4 flex-1 min-w-0">
                        <div className="flex items-center justify-center gap-2 shrink-0">
                            <span className="material-symbols-outlined text-teal-600 text-xl">local_shipping</span>
                            <h2 className="text-base  text-slate-500 whitespace-nowrap">
                                Phương thức vận chuyển:
                            </h2>
                        </div>

                        <div className="truncate">
                            <span className="text-base  text-slate-700">
                                {shippingOptions.find(opt => opt.id === shippingMethod)?.label}
                            </span>
                            <span className="hidden md:inline-block ml-2 text-[13px] text-slate-400 italic">
                                (Dự kiến: {shippingOptions.find(opt => opt.id === shippingMethod)?.time})
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                        <span className="text-base  text-slate-700 tabular-nums">
                            {currentShippingPrice === 0 ? 'Miễn phí' : `₫${currentShippingPrice.toLocaleString()}`}
                        </span>

                        <button
                            onClick={() => setShowShippingModal(true)}
                            className=" text-blue-600 hover:text-blue-800 cursor-pointer transition-colors border-l border-slate-200 pl-6 h-6 flex items-center"
                        >
                            Thay đổi
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-none p-4 flex flex-row items-center justify-between gap-6">
                    <div className="flex items-center justify-center gap-2 shrink-0">
                        <span className="material-symbols-outlined text-primary text-lg">payments</span>
                        <h2 className="text-base  text-slate-500 whitespace-nowrap">
                            Phương thức thanh toán
                        </h2>
                    </div>

                    <div className="flex flex-row gap-2 overflow-x-auto py-1 scrollbar-hide flex-1 justify-end">
                        {[
                            { id: 'CASH', label: 'Tiền mặt', icon: 'payments', color: 'text-amber-500' },
                            { id: 'CARD', label: 'Thẻ ATM', icon: 'credit_card', color: 'text-blue-500' },
                            { id: 'MOMO', label: 'Ví Momo', icon: 'account_balance_wallet', color: 'text-[#A50064]' },
                            { id: 'VNPAY', label: 'VNPAY', icon: 'qr_code_scanner', color: 'text-[#005BAA]' },
                        ].map((pm) => (
                            <label
                                key={pm.id}
                                className={`flex items-center gap-3 p-2.5 px-4 border cursor-pointer transition-all rounded-lg shrink-0
                                    ${paymentMethod === pm.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className="relative flex items-center justify-center shrink-0">
                                    <input type="radio" name="payment" checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} className="appearance-none size-4 rounded-full border-2 border-slate-300 checked:border-primary cursor-pointer" />
                                    {paymentMethod === pm.id && <div className="absolute size-2 bg-primary rounded-full animate-in zoom-in duration-200"></div>}
                                </div>
                                <div className={`size-7 rounded-full bg-slate-50 flex items-center justify-center shrink-0 ${pm.color}`}>
                                    <span className="material-symbols-outlined text-base">{pm.icon}</span>
                                </div>
                                <span className="text-[14px]  text-slate-800 whitespace-nowrap">{pm.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-none p-4 flex flex-row items-center justify-between gap-6">
                    <div className="flex items-center justify-center gap-2 shrink-0">
                        <span className="material-symbols-outlined text-primary text-lg">local_activity</span>
                        <h2 className="text-base  text-slate-500 whitespace-nowrap">
                            Voucher của ChoiCoffee
                        </h2>
                    </div>

                    <div className="flex flex-col items-end">
                        <button
                            onClick={() => setShowVoucherModal(true)}
                            className="flex items-center gap-2 transition-all group cursor-pointer"
                        >
                            {voucherCode ? (
                                <span className="text-[14px] font-black text-primary">
                                    Mã: {voucherCode}
                                </span>
                            ) : (
                                <span className="text-[14px] font-bold text-slate-400 group-hover:text-primary transition-colors">
                                    Chọn hoặc nhập mã
                                </span>
                            )}
                            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all text-lg">
                                chevron_right
                            </span>
                        </button>

                        {voucherCode && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setVoucherCode(''); }}
                                className="mt-0.5 text-[9px] text-red-500 font-black uppercase hover:underline cursor-pointer"
                            >
                                Gỡ mã
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-none p-8 flex flex-col items-end">
                    <div className="w-full max-w-sm space-y-3">
                        <div className="flex justify-between text-[14px] text-slate-500 ">
                            <span>Tạm tính ({products.length} món)</span>
                            <span className="text-slate-800 font-bold tracking-tight">₫{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[14px] text-slate-500 ">
                            <span>
                                Phí giao hàng ({shippingOptions.find(opt => opt.id === shippingMethod)?.label})
                            </span>

                            <span className="font-bold text-teal-600 uppercase text-sm">
                                {currentShippingPrice === 0
                                    ? 'Miễn phí'
                                    : `+ ₫${currentShippingPrice.toLocaleString()}`
                                }
                            </span>
                        </div>
                        <div className="flex justify-between text-[14px] text-slate-500  border-b border-slate-100 pb-3">
                            <span>Giảm giá Voucher</span>
                            <span className="text-red-500 font-bold">-₫0</span>
                        </div>
                        <div className="flex justify-between items-center pt-4">
                            <span className="font-black text-slate-800 uppercase text-[14px]">Tổng thanh toán</span>
                            <span className="text-[24px] font-black text-primary tabular-nums tracking-tighter">₫{finalTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="w-full max-w-sm pt-10">
                        <ButtonSubmit
                            label={isLoading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                            disabled={isLoading}
                            onClick={() => {
                                setIsLoading(true);
                                setTimeout(() => { setIsLoading(false); alert("Đặt hàng thành công!"); }, 2000);
                            }}
                        />
                    </div>
                    <p className="w-full max-w-sm text-center text-sm italic text-slate-400 mt-4">
                        Kiểm tra kỹ thông tin trước khi xác nhận
                    </p>
                </div>
            </div>

            <VoucherModal
                isOpen={showVoucherModal}
                onClose={() => setShowVoucherModal(false)}
                onApply={(code) => { setVoucherCode(code); setShowVoucherModal(false); }}
            />

            {/* --- SHIPPING MODAL (TÍCH HỢP TRONG PAGE) --- */}
            {showShippingModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-none shadow-2xl overflow-hidden animate-in zoom-in duration-150">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="font-black text-[14px] uppercase tracking-widest text-slate-800">Chọn vận chuyển</h2>
                            <button onClick={() => setShowShippingModal(false)} className="material-symbols-outlined text-slate-400 hover:text-red-500 cursor-pointer">close</button>
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
                                                    setShowShippingModal(false); // Chọn xong đóng luôn cho mượt
                                                }}
                                                className="appearance-none size-5 rounded-full border-2 border-slate-300 checked:border-primary transition-all cursor-pointer"
                                            />
                                            {shippingMethod === method.id && (
                                                <div className="absolute size-2.5 bg-primary rounded-full"></div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-bold text-slate-800">{method.label}</p>
                                            <p className="text-sm text-slate-400 italic">Dự kiến: {method.time}</p>
                                        </div>
                                    </div>
                                    <span className="text-[14px] font-black text-primary">
                                        {method.price === 0 ? 'Free' : `₫${method.price.toLocaleString()}`}
                                    </span>
                                </label>
                            ))}
                        </div>

                        <div className="p-4 border-t border-slate-50 flex justify-end bg-slate-50/50 text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                            Vận chuyển bởi ChoiCoffee Logistic
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;