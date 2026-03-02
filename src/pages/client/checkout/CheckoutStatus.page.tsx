import ROUTER_URL from '@/routes/router.const';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';

const CheckoutStatusPage: React.FC = () => {
    const navigate = useNavigate();


    const [searchParams] = useSearchParams();
    const success = searchParams.get('success') === 'true'; 

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center py-10 px-4 animate-in fade-in duration-500">
            <div className="max-w-[520px]">

                <div className="bg-white border border-slate-200 overflow-hidden shadow-lg rounded-lg">
                    <div className={`h-1.5 w-full ${success ? 'bg-green-500' : 'bg-red-500'}`}></div>

                    <div className="p-4 md:p-10 flex flex-col items-center text-center">
                        <div className={`size-24 rounded-full flex items-center justify-center mb-6 
                            ${success ? 'bg-green-100 text-green-500' : 'bg-red-50 text-red-500'}`}>
                            <span className="material-symbols-outlined !text-6xl ">
                                {success ? 'check_circle' : 'error'}
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-800 mb-3">
                            {success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
                        </h1>

                        <p className="text-slate-500 text-base mb-10">
                            {success
                                ? 'Cảm ơn bạn! Đơn hàng vật tư của bạn đã được hệ thống ghi nhận và đang trong quá trình chuẩn bị giao hàng.'
                                : 'Rất tiếc, giao dịch của bạn không thể hoàn tất. Vui lòng kiểm tra lại phương thức thanh toán hoặc số dư tài khoản.'}
                        </p>

                        <div className="flex flex-col w-full gap-3">
                            {success ? (
                                <div className='flex flex-row gap-3 '>
                                    <button
                                        onClick={() => navigate(ROUTER_URL.CLIENT_ROUTER.CLIENT_ORDER_DETAIL)}
                                        className="w-full bg-primary text-white rounded-lg py-2 md:py-3 transition-all hover:bg-primary/90 active:scale-95 cursor-pointer shadow-lg shadow-primary/20"
                                    >
                                        Xem chi tiết thực đơn
                                    </button>
                                    <button
                                        onClick={() => navigate(ROUTER_URL.HOME)}
                                        className="w-full bg-white border rounded-lg border-slate-400 text-slate-400  py-2 md:py-3 transition-all hover:bg-slate-50 cursor-pointer"
                                    >
                                        Về trang chủ
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => navigate(ROUTER_URL.CLIENT_ROUTER.CHECKOUT)}
                                    className="w-full flex flex-row items-center justify-center gap-3 bg-red-500 text-white rounded-lg py-2 md:py-3 transition-all hover:bg-red-600 active:scale-95 cursor-pointer shadow-lg shadow-red-500/20"
                                >
                                    <span className="material-symbols-outlined text-base">refresh</span>
                                    Thanh toán lại
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Hỗ trợ nhanh */}
            <p className="text-center text-slate-400 text-sm mt-5">
                Gặp sự cố? 
                <span
                    onClick={() => navigate(ROUTER_URL.CONTACT)}
                    className="text-primary font-bold cursor-pointer hover:underline ml-2">
                    Liên hệ hỗ trợ ngay
                </span>
            </p>
        </div>
    );
};

export default CheckoutStatusPage;