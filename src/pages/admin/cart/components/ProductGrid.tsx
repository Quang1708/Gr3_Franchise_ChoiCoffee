import { useState } from "react";
import { Plus, Coffee, Star, Package } from "lucide-react";
import AdminToppingModal from "./AdminToppingModal";


const ProductGrid = ({ products, onAdd, loading, franchiseId, toppingId }: any) => {
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const handleOpenModal = (p: any) => {
        setSelectedProduct(p);
    };

    const handleConfirmAdd = (cartItem: any) => {
        onAdd(cartItem);
        setSelectedProduct(null);
    };

    // Kiểm tra sản phẩm còn size khả dụng không
    const isProductAvailable = (product: any) => {
        if (!product.sizes || product.sizes.length === 0) return false;
        return product.sizes.some((size: any) => size.is_available === true);
    };

    // Lấy giá của size khả dụng đầu tiên
    const getAvailablePrice = (product: any) => {
        const availableSize = product.sizes?.find((s: any) => s.is_available);
        return availableSize?.price || 0;
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="relative">
                    <div className="w-12 h-12 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
                    <Coffee className="w-5 h-5 text-primary/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-xs font-medium text-gray-400 ml-3">ĐANG TẢI SẢN PHẨM...</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <Package className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500">Không có sản phẩm</p>
                    <p className="text-xs text-gray-400 mt-1">Danh mục này chưa có sản phẩm nào</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex-1 overflow-y-auto p-5">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {products.map((p: any, index: number) => {
                        const isAvailable = isProductAvailable(p);
                        const availablePrice = getAvailablePrice(p);

                        return (
                            <div
                                key={p.product_id}
                                className={`group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 border-2 
                                    ${isAvailable
                                        ? "border-gray-100 hover:border-primary/50 cursor-pointer hover:shadow-lg animate-fadeInUp"
                                        : "border-gray-200 opacity-90 cursor-not-allowed"
                                    }
                                `}
                                onClick={() => isAvailable && handleOpenModal(p)}
                                style={{
                                    animationDelay: `${index * 0.03}s`
                                }}
                            >
                                {/* Image */}
                                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                                    <img
                                        src={p.image_url}
                                        alt={p.name}
                                        className={`w-full h-full object-cover transition-transform duration-500
                                            ${isAvailable ? "group-hover:scale-105" : ""}
                                        `}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

                                    {/* Sold Out Badge */}
                                    {!isAvailable && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                                HẾT HÀNG
                                            </span>
                                        </div>
                                    )}

                                    {/* Badges */}
                                    <div className="absolute top-2 left-2 flex gap-1">
                                        {p.is_have_topping && isAvailable && (
                                            <span className="bg-white/95 backdrop-blur-sm text-primary text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm">
                                                + Topping
                                            </span>
                                        )}
                                    </div>

                                    {p.is_popular && isAvailable && (
                                        <div className="absolute top-2 right-2">
                                            <span className="bg-primary text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                                <Star className="w-2.5 h-2.5 fill-current" />
                                                Phổ biến
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-3">
                                    <h4 className={`text-sm font-semibold text-gray-800 line-clamp-2 leading-tight mb-1
                                        ${!isAvailable ? "line-through text-gray-400" : ""}
                                    `}>
                                        {p.name}
                                    </h4>
                                    {p.description && (
                                        <p className={`text-xs text-gray-400 line-clamp-1
                                            ${!isAvailable ? "text-gray-300" : ""}
                                        `}>
                                            {p.description}
                                        </p>
                                    )}
                                    <div className="mt-3 flex items-center justify-between">
                                        <div>
                                            <span className="text-xs text-gray-500">Từ</span>
                                            <p className={`text-sm font-bold ${isAvailable ? "text-primary" : "text-gray-400"}`}>
                                                {availablePrice.toLocaleString()}đ
                                            </p>
                                        </div>
                                        <button
                                            title="Thêm vào giỏ"
                                            disabled={!isAvailable}
                                            className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center shadow-sm
                                                ${isAvailable
                                                    ? "bg-gray-900 group-hover:bg-primary text-white hover:scale-110 active:scale-95 cursor-pointer"
                                                    : "bg-gray-300 text-gray-400 cursor-not-allowed"
                                                }
                                            `}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (isAvailable) handleOpenModal(p);
                                            }}
                                        >
                                            <Plus size={14} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedProduct && (
                <AdminToppingModal
                    toppingId = {toppingId} 
                    franchiseId={franchiseId}
                    isOpen={!!selectedProduct}
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onConfirm={handleConfirmAdd}
                />
            )}
        </>
    );
};

export default ProductGrid;