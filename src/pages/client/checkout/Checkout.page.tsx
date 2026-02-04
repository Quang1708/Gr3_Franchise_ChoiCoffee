const CheckoutPage = () => {
    return (
        <div className="flex-1 flex flex-col bg-slate-50/50 font-display overflow-x-hidden mx-auto px-4 py-10 text-base">
            <div className="max-w-[1200px] mx-auto w-full">

                {/* TIÊU ĐỀ TRANG */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">
                        Thanh toán đơn hàng
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* CỘT TRÁI (8 CỘT): THÔNG TIN GIAO HÀNG & THANH TOÁN */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* 1. ĐỊA CHỈ NHẬN HÀNG */}
                        <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2 font-bold text-slate-800 uppercase text-sm tracking-wide">
                                    <span className="material-symbols-outlined text-primary">location_on</span>
                                    Địa chỉ nhận hàng
                                </div>
                                <button className="text-primary text-xs font-bold hover:underline">Thay đổi</button>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-slate-800">Trần Thị Huyền Trân</span>
                                            <span className="text-slate-300">|</span>
                                            <span className="text-slate-600">0907 293 510</span>
                                        </div>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            Đại học Công nghiệp TP.HCM (IUH), Số 12 Nguyễn Văn Bảo, Phường 4, Quận Gò Vấp, TP. Hồ Chí Minh
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. PHƯƠNG THỨC THANH TOÁN */}
                        <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-50 flex items-center gap-2 font-bold text-slate-800 uppercase text-sm tracking-wide">
                                <span className="material-symbols-outlined text-primary">payments</span>
                                Phương thức thanh toán
                            </div>
                            <div className="p-6 space-y-4">
                                {/* Option 1 */}
                                <label className="flex items-center justify-between p-4 border border-primary bg-primary/5 rounded-lg cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="size-5 rounded-full border-4 border-primary bg-white"></div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">Thanh toán bằng ví đối tác (Hệ thống)</p>
                                            <p className="text-xs text-slate-500">Số dư hiện tại: <span className="text-primary font-bold">₫15.000.000</span></p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                                </label>

                                {/* Option 2 */}
                                <label className="flex items-center justify-between p-4 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="size-5 rounded-full border border-slate-300 bg-white"></div>
                                        <p className="font-bold text-slate-800 text-sm">Chuyển khoản ngân hàng (Quét mã QR)</p>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-400">qr_code_2</span>
                                </label>
                            </div>
                        </div>

                        {/* 3. GHI CHÚ ĐƠN HÀNG */}
                        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-6">
                            <label className="block font-bold text-slate-800 text-sm uppercase mb-3">Ghi chú nhập hàng</label>
                            <textarea
                                placeholder="Ví dụ: Giao vào giờ hành chính, gọi trước khi đến 15 phút..."
                                className="w-full h-24 border border-slate-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* CỘT PHẢI (4 CỘT): TÓM TẮT ĐƠN HÀNG */}
                    <div className="lg:col-span-4">
                        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-6 sticky top-4">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
                                <span className="material-symbols-outlined text-primary">shopping_bag</span>
                                Tóm tắt đơn hàng
                            </h3>

                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {/* Render nhanh 2 item mẫu */}
                                {[
                                    { name: "Hạt Cà Phê Robusta Honey", qty: 10, price: 1500000 },
                                    { name: "Sữa đặc chuyên dụng Choi", qty: 2, price: 1200000 }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start text-sm">
                                        <div className="flex-1 pr-4">
                                            <p className="font-bold text-slate-700 line-clamp-1">{item.name}</p>
                                            <p className="text-slate-400 text-xs text-right md:text-left">Số lượng: {item.qty}</p>
                                        </div>
                                        <span className="font-bold text-slate-800">₫{item.price.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-slate-100 text-sm">
                                <div className="flex justify-between text-slate-500">
                                    <span>Tạm tính</span>
                                    <span className="font-bold text-slate-800">₫2.700.000</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Phí vận chuyển</span>
                                    <span className="font-bold text-slate-800 text-green-600">Miễn phí</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Chiết khấu đối tác</span>
                                    <span className="font-bold text-red-500">-₫135.000</span>
                                </div>

                                <div className="pt-4 mt-2 border-t border-dashed border-slate-200">
                                    <div className="flex justify-between items-end">
                                        <span className="font-black text-slate-800 text-base">Tổng thanh toán:</span>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-primary leading-none tracking-tight">₫2.565.000</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="w-full mt-8 rounded-xl bg-primary h-14 text-white font-black uppercase text-sm tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                            >
                                Xác nhận thanh toán
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
                                <span className="material-symbols-outlined text-xs">shield_lock</span>
                                THANH TOÁN AN TOÀN & BẢO MẬT
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;