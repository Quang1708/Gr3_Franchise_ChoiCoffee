import React, { useState } from 'react';

const CheckoutPage = () => {
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'MOMO' | 'VNPAY'>('VNPAY');
    const [isEditing, setIsEditing] = useState(false);
    const [shippingInfo, setShippingInfo] = useState({
        name: "Trần Thị Huyền Trân",
        phone: "0907 293 510",
        address: "Đại học Công nghiệp TP.HCM (IUH), Số 12 Nguyễn Văn Bảo, Phường 4, Quận Gò Vấp, TP. Hồ Chí Minh"
    });
    const [voucherCode, setVoucherCode] = useState('');

    const [cartItems] = useState([
        {
            product_franchise_id: 1,
            SKU: "ROB-HON-001",
            product_name: "Hạt Cà Phê Robusta Honey",
            price_base: 150000,
            quantity: 10,
            image_url: "https://picsum.photos/200?random=1"
        },
        {
            product_franchise_id: 2,
            SKU: "MILK-CHOI-001",
            product_name: "Sữa đặc chuyên dụng Choi",
            price_base: 600000,
            quantity: 2,
            image_url: "https://picsum.photos/200?random=2"
        }
    ]);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price_base * item.quantity), 0);
    const discount = 135000;
    const total = subtotal - discount;

    return (
        <div className="flex-1 flex flex-col bg-[#f5f5f5] font-display min-h-screen pb-20">
            {/* 1. ĐỊA CHỈ NHẬN HÀNG (Dải trên cùng kiểu Shopee) */}
            <div className="bg-white border-b-2 border-dashed border-red-400 mb-4">
                <div className="max-w-[1200px] mx-auto p-6">
                    <div className="flex items-center gap-2 text-primary mb-4">
                        <span className="material-symbols-outlined">location_on</span>
                        <h3 className="text-lg font-bold uppercase tracking-tight">Địa chỉ nhận hàng</h3>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            {isEditing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input value={shippingInfo.name} onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})} className="border p-2 rounded text-sm outline-none focus:border-primary" placeholder="Tên" />
                                    <input value={shippingInfo.phone} onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})} className="border p-2 rounded text-sm outline-none focus:border-primary" placeholder="SĐT" />
                                    <textarea value={shippingInfo.address} onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})} className="border p-2 rounded text-sm outline-none focus:border-primary md:col-span-2" rows={2} placeholder="Địa chỉ" />
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="font-black text-slate-800">{shippingInfo.name} ({shippingInfo.phone})</span>
                                    <span className="text-slate-600 line-clamp-1">{shippingInfo.address}</span>
                                    <span className="border border-primary text-primary text-[10px] px-1 font-bold">Mặc định</span>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setIsEditing(!isEditing)} className="text-blue-600 text-sm font-medium hover:underline flex-shrink-0">
                            {isEditing ? 'Hoàn thành' : 'Thay đổi'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto w-full space-y-4 px-4">
                
                {/* 2. BẢNG SẢN PHẨM */}
                <div className="bg-white rounded-sm shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 p-4 text-sm text-slate-400 border-b">
                        <div className="col-span-6">Sản phẩm</div>
                        <div className="col-span-2 text-center">Đơn giá</div>
                        <div className="col-span-2 text-center">Số lượng</div>
                        <div className="col-span-2 text-right">Thành tiền</div>
                    </div>
                    <div className="divide-y">
                        {cartItems.map((item) => (
                            <div key={item.product_franchise_id} className="grid grid-cols-12 p-4 items-center text-sm">
                                <div className="col-span-6 flex gap-3 items-center">
                                    <img src={item.image_url} className="size-12 object-cover border" alt="" />
                                    <span className="font-medium text-slate-800 line-clamp-1">{item.product_name}</span>
                                </div>
                                <div className="col-span-2 text-center text-slate-500">₫{item.price_base.toLocaleString()}</div>
                                <div className="col-span-2 text-center text-slate-800 font-bold">{item.quantity}</div>
                                <div className="col-span-2 text-right font-bold">₫{(item.price_base * item.quantity).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. VOUCHER DẢI RIÊNG */}
                <div className="bg-white rounded-sm shadow-sm p-4 flex items-center justify-between border-b border-dashed border-slate-100">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <span className="material-symbols-outlined">confirmation_number</span>
                        <span>ChoiCoffee Voucher</span>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="text-xs text-slate-400">Chọn hoặc nhập mã</span>
                        <button onClick={() => setVoucherCode('CHOI123')} className="text-blue-600 text-sm font-medium uppercase">Chọn voucher</button>
                    </div>
                </div>

                {/* 4. PHƯƠNG THỨC THANH TOÁN & TỔNG TIỀN */}
                <div className="bg-white rounded-sm shadow-sm">
                    <div className="p-6 border-b flex flex-col md:flex-row md:items-center gap-6">
                        <h3 className="text-sm font-bold text-slate-800 uppercase min-w-[200px]">Phương thức thanh toán</h3>
                        <div className="flex flex-wrap gap-2">
                            {['VNPAY', 'MOMO', 'CARD', 'CASH'].map((m) => (
                                <button 
                                    key={m} 
                                    onClick={() => setPaymentMethod(m as any)} 
                                    className={`px-6 py-2 border rounded-sm text-xs font-bold transition-all ${paymentMethod === m ? 'border-primary text-primary bg-primary/5' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 bg-[#fffefb] flex flex-col items-end space-y-4">
                        <div className="w-full md:w-[400px] space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Tổng tiền hàng</span>
                                <span>₫{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Phí vận chuyển</span>
                                <span>₫0</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Giảm giá Voucher</span>
                                <span className="text-primary">-₫{discount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                <span className="text-lg">Tổng thanh toán:</span>
                                <span className="text-3xl font-black text-primary leading-none tracking-tighter">₫{total.toLocaleString()}</span>
                            </div>
                            <button className="w-full mt-6 bg-primary h-14 text-white font-bold uppercase rounded-sm shadow-md hover:brightness-110 active:scale-95 transition-all">
                                Đặt hàng
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CheckoutPage;