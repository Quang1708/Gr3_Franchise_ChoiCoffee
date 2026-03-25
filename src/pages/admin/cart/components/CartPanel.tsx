import CheckoutModal from "@/pages/admin/cart/components/CheckoutModal";
import { Minus, Plus, Trash2, ShoppingBag, Edit2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

const CartPanel = ({ cart, updateQty, total, onEditItem, franchise }: any) => {
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);

    const handleCheckout = async (customerInfo: any) => {
       toast.success(`Đơn hàng đã được tạo cho ${customerInfo.name}!`);
       setShowCheckoutModal(false);
    };
    

    return (
        <div className="w-95 bg-white flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0">
                <h2 className="text-sm font-semibold text-gray-800 tracking-wide">
                    GIỎ HÀNG
                </h2>
                {cart.length > 0 && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {cart.reduce((sum: any, item: any) => sum + item.quantity, 0)} món
                    </span>
                )}
            </div>

            {/* Cart Items - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scroll">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                            <ShoppingBag className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-500">Giỏ hàng trống</p>
                        <p className="text-xs text-gray-400 mt-1">Hãy chọn món để bắt đầu</p>
                    </div>
                ) : (
                    cart.map((item: any, idx: number) => (
                        <div
                            key={item.key || idx}
                            className="bg-gray-50 rounded-xl p-3 hover:shadow-sm transition-shadow"
                        >
                            {/* Action Buttons */}
                            <div className="flex justify-end items-center gap-1 mb-2">
                                {item.is_have_topping && (
                                    <button
                                        onClick={() => onEditItem?.(item)}
                                        className="text-gray-400 hover:text-primary transition-colors p-1"
                                        title="Chỉnh sửa topping"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                )}
                                <button
                                    onClick={() => updateQty(item.key, -Infinity)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                    title="Xóa"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {/* Product Info - Name and Price on same line */}
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-sm font-medium text-gray-800">{item.name}</h4>
                                        {item.size && (
                                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                {item.size}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-semibold text-primary">
                                        {(item.price * item.quantity).toLocaleString()}đ
                                    </span>
                                </div>
                            </div>

                            {/* Toppings */}
                            {item.toppings && item.toppings.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs text-gray-500 mb-2">Topping:</p>
                                    <div className="space-y-1">
                                        {item.toppings.map((topping: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between text-xs">
                                                <span className="text-gray-600">
                                                    {topping.name} x{topping.quantity}
                                                </span>
                                                <span className="text-amber-600 font-medium">
                                                    +{(topping.price * topping.quantity).toLocaleString()}đ
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Note */}
                            {item.note && (
                                <div className="mb-2">
                                    <p className="text-xs text-gray-500 p-1.5 rounded-lg bg-white">
                                        {item.note}
                                    </p>
                                </div>
                            )}

                            {/* Quantity Controls & Total */}
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                    <button
                                        title="Giảm số lượng"
                                        onClick={() => updateQty(item.key, -1)}
                                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-colors flex items-center justify-center"
                                    >
                                        <Minus size={12} className="text-gray-600" />
                                    </button>
                                    <span className="text-sm font-medium min-w-7 text-center">
                                        {item.quantity}
                                    </span>
                                    <button
                                        title="Tăng số lượng"
                                        onClick={() => updateQty(item.key, 1)}
                                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-colors flex items-center justify-center"
                                    >
                                        <Plus size={12} className="text-gray-600" />
                                    </button>
                                </div>

                                <div className="text-right">
                                    <span className="text-sm font-semibold text-primary">
                                        {item.total_price?.toLocaleString()}đ
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
                <div className="p-5 border-t border-gray-100 bg-white shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs text-gray-500">Tổng cộng</p>
                        <p className="text-xl font-bold text-primary">
                            {total.toLocaleString()}đ
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCheckoutModal(true)}
                        className="w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Kiểm tra đơn hàng"
                    >
                        Kiểm tra đơn hàng
                    </button>
                </div>
            )}

            {showCheckoutModal && (
                <CheckoutModal
                    franchise={franchise}
                    isOpen={showCheckoutModal}
                    onClose={() => setShowCheckoutModal(false)}
                    cart={cart}
                    total={total}
                    onConfirm={handleCheckout}
                />
            )}
        </div>
    );
};

export default CartPanel;