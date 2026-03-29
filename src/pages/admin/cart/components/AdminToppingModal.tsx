import { useState, useEffect } from "react";
import { useCustomerAuthStore } from "@/stores/customerAuth.store";
import { toast } from "react-toastify";
import type { ProductDetail } from "@/pages/client/product/models/product.models";
import type { Product } from "@/components/Client/Product/models/product.model";
import { getPublicProducts } from "@/components/Client/Product/services/product.service";
import type { AddCartRequest } from "@/components/Client/Product/models/addCart.model";
import { addItemToCart } from "@/components/Client/Product/services/cart02.service";
import ButtonSubmit from "@/components/Client/Button/ButtonSubmit";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
// import type { ProductFranchise } from "../../product/models/productFranchise/productFranchise.model";

const MAX_ITEMS = 10;
const MONGODB_ID_REGEX = /^[a-f\d]{24}$/i;

type Sizes = {
    product_franchise_id: string;
    size: string;
    price: number;
    is_available: boolean;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    product: Product | ProductDetail;
    onConfirm?: (data: any) => void;
    initialData?: {
        size: string;
        size_id: string;
        quantity: number;
        toppings: any[];
        note: string;
        key?: string;
    };
    franchiseId?: any; 
    toppingId?: string;
};

const AdminToppingModal = ({ isOpen, onClose, product, onConfirm, initialData, franchiseId, toppingId }: Props) => {
    const [toppings, setToppings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [sizeSelected, setSizeSelected] = useState<Sizes | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [toppingSelected, setToppingSelected] = useState<Record<string, number>>({});
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { customer } = useCustomerAuthStore();

    const getValidToppingSize = (topping: any) => {
        if (!Array.isArray(topping?.sizes)) return null;

        return topping.sizes.find(
            (size: any) => size?.is_available && MONGODB_ID_REGEX.test(size?.product_franchise_id || "")
        ) || topping.sizes.find((size: any) => MONGODB_ID_REGEX.test(size?.product_franchise_id || "")) || null;
    };

    // Fetch toppings
    useEffect(() => {
        const fetchToppings = async () => {
            if (!isOpen || !product?.is_have_topping || !franchiseId || !toppingId) {
                setToppings([]);
                return;
            }

            setLoading(true);
            try {
                const res = await getPublicProducts(franchiseId, toppingId);
                if (Array.isArray(res)) {
                    setToppings(res);
                } else {
                    setToppings([]);
                }
            } catch (err) {
                console.error("Fetch topping lỗi:", err);
                setToppings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchToppings();
    }, [isOpen, franchiseId, toppingId, product?.is_have_topping]);

    // Initialize with initialData if editing
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Editing mode: load existing data
                const size = product.sizes?.find(s => s.product_franchise_id === initialData.size_id);
                setSizeSelected(size || product.sizes?.[0] || null);
                setQuantity(initialData.quantity);
                setNote(initialData.note || "");

                // Set selected toppings
                const toppingMap: Record<string, number> = {};
                initialData.toppings?.forEach((t: any) => {
                    toppingMap[t.product_id] = t.quantity;
                });
                setToppingSelected(toppingMap);
            } else {
                // New mode: reset to default
                setSizeSelected(product.sizes?.[0] || null);
                setQuantity(1);
                setToppingSelected({});
                setNote("");
            }
        }
    }, [isOpen, product, initialData]);

    if (!isOpen) return null;

    const totalTopping = Object.values(toppingSelected).reduce((a, b) => a + b, 0);
    const sizePrice = sizeSelected?.price || 0;
    const toppingPrice = toppings.reduce((sum, t) => {
        const count = toppingSelected[t.product_id] || 0;
        const toppingSize = getValidToppingSize(t);
        return sum + count * (toppingSize?.price || 0);
    }, 0);
    const totalPrice = (sizePrice + toppingPrice) * quantity;

    const increaseTopping = (id: string) => {
        if (totalTopping >= MAX_ITEMS) return;
        setToppingSelected((prev) => ({
            ...prev,
            [id]: (prev[id] || 0) + 1,
        }));
    };

    const decreaseTopping = (id: string) => {
        setToppingSelected((prev) => ({
            ...prev,
            [id]: Math.max(0, (prev[id] || 0) - 1),
        }));
    };

    const handleConfirm = async () => {
        if (!sizeSelected || !franchiseId) {
            toast.error("Vui lòng chọn size và chi nhánh!");
            return;
        }

        const cartItem = {
            id: initialData?.key || `${product.product_id}_${sizeSelected.product_franchise_id}_${Date.now()}`,
            product_id: product.product_id,
            name: product.name,
            image_url: product.image_url,
            description: product.description,
            size: sizeSelected.size,
            size_id: sizeSelected.product_franchise_id,
            price: sizePrice,
            quantity: quantity,
            toppings: product?.is_have_topping ? toppings
                .filter((t) => toppingSelected[t.product_id] > 0)
                .map(t => ({
                    id: getValidToppingSize(t)?.product_franchise_id,
                    product_id: t.product_id,
                    name: t.name,
                    price: getValidToppingSize(t)?.price || 0,
                    quantity: toppingSelected[t.product_id]
                }))
                .filter((t) => MONGODB_ID_REGEX.test(t.id || "")) : [],
            note: note,
            total_price: totalPrice,
            is_have_topping: product?.is_have_topping || false // Thêm field này
        };

        if (onConfirm) {
            onConfirm(cartItem);
            onClose();
        } else {
            // Call API add to cart
            const options = toppings
                .filter((t) => toppingSelected[t.product_id] > 0)
                .map((t) => ({
                    product_franchise_id: getValidToppingSize(t)?.product_franchise_id || "",
                    quantity: toppingSelected[t.product_id],
                }))
                .filter((option) => MONGODB_ID_REGEX.test(option.product_franchise_id));

            const payload: AddCartRequest = {
                franchise_id: franchiseId,
                product_franchise_id: sizeSelected.product_franchise_id,
                quantity,
                address: customer?.address || "",
                phone: customer?.phone || "",
                note,
                message: "",
                options,
            };

            setIsSubmitting(true);
            try {
                await addItemToCart(payload);
                toast.success("Đã thêm vào giỏ hàng!");
                onClose();
            } catch (err) {
                console.error("Lỗi thêm giỏ hàng", err);
                toast.error("Lỗi thêm giỏ hàng!");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg flex flex-col max-h-[90vh] overflow-hidden">
                {/* HEADER */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start gap-4">
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-20 h-20 rounded-xl object-cover shadow-sm"
                        />
                        <div className="flex-1">
                            <h2 className="text-lg font-medium text-gray-800">
                                {initialData ? `Sửa: ${product.name}` : product.name}
                            </h2>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                                {product.description}
                            </p>
                        </div>
                        <button
                            title="Đóng"
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* SIZE */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">Chọn size</p>
                        <div className="grid grid-cols-3 gap-2">
                            {product.sizes?.map((s: Sizes) => {
                                const active = sizeSelected?.product_franchise_id === s.product_franchise_id;
                                const isSoldOut = !s.is_available;

                                return (
                                    <button
                                        key={s.product_franchise_id}
                                        onClick={() => !isSoldOut && setSizeSelected(s)}
                                        disabled={isSoldOut}
                                        className={`py-2 rounded-lg transition-all text-center text-sm relative
                                            ${active && !isSoldOut
                                                ? "bg-primary text-white shadow-sm"
                                                : isSoldOut
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                                                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                                            }
                                        `}
                                    >
                                        <div className={`font-bold ${isSoldOut ? "line-through" : ""}`}>
                                            {s.size}
                                        </div>
                                        <div className={`text-xs mt-0.5 ${active && !isSoldOut
                                                ? "text-amber-100"
                                                : isSoldOut
                                                    ? "text-gray-400"
                                                    : "text-gray-500"
                                            }`}>
                                            {s.price.toLocaleString()}đ
                                        </div>
                                        {isSoldOut && (
                                            <div className="absolute -top-2 -right-2">
                                                <span className="text-[9px] font-medium bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                                                    Hết
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* QUANTITY */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">Số lượng</p>
                        <div className="flex items-center gap-3">
                            <button
                                title="Giảm số lượng"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-8 h-8 rounded-lg border border-gray-200 hover:border-primary/30 hover:bg-primary/5 flex items-center justify-center"
                            >
                                <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="w-12 text-center font-medium text-gray-800">{quantity}</span>
                            <button
                                title="Tăng số lượng"
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-8 h-8 rounded-lg border border-gray-200 hover:border-primary/30 hover:bg-primary/5 flex items-center justify-center"
                            >
                                <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* TOPPING */}
                    {product.is_have_topping && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-700">Topping</h3>
                                <span className="text-xs text-gray-500">
                                    {totalTopping}/{MAX_ITEMS}
                                </span>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-6">
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : toppings.length === 0 ? (
                                <p className="text-center text-xs text-gray-400 py-6">Không có topping</p>
                            ) : (
                                <div className="space-y-2">
                                    {toppings.map((t) => {
                                        const count = toppingSelected[t.product_id] || 0;
                                        const size = getValidToppingSize(t);
                                        const soldOut = !size?.is_available;

                                        return (
                                            <div
                                                key={t.product_id}
                                                className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors
                                                    ${count > 0 ? "bg-amber-50/50" : "bg-gray-50"}
                                                    ${soldOut ? "opacity-60" : ""}
                                                `}
                                            >
                                                <img
                                                    src={t.image_url}
                                                    alt={t.name}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                                <div className="flex-1">
                                                    <div className={`text-sm font-medium text-gray-800 ${soldOut ? "line-through" : ""}`}>
                                                        {t.name}
                                                    </div>
                                                    <div className="text-xs text-primary mt-0.5">
                                                        +{size?.price.toLocaleString()}đ
                                                    </div>
                                                </div>
                                                {!soldOut && (
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            title="Giảm số lượng"
                                                            onClick={() => decreaseTopping(t.product_id)}
                                                            className="w-6 h-6 rounded-md bg-white border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-colors flex items-center justify-center"
                                                        >
                                                            <Minus className="w-3 h-3 text-gray-500" />
                                                        </button>
                                                        <span className="w-5 text-center text-sm font-medium text-gray-700">
                                                            {count}
                                                        </span>
                                                        <button
                                                            title="Tăng số lượng"
                                                            onClick={() => increaseTopping(t.product_id)}
                                                            disabled={totalTopping >= MAX_ITEMS}
                                                            className="w-6 h-6 rounded-md bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                                        >
                                                            <Plus className="w-3 h-3 text-white" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* NOTE */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Ghi chú</h3>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors resize-none bg-gray-50 placeholder:text-xs"
                            placeholder="Ví dụ: ít đá, ít đường..."
                        />
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-5 border-t border-gray-100 bg-white">
  <div className="max-w-7xl mx-auto flex items-end justify-between">
    {/* Nhóm thông tin giá: Đưa về sát lề trái, căn lề dưới (items-end) với nút bấm */}
    <div className="space-y-0.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        Thành tiền
      </p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-primary">
          {totalPrice.toLocaleString()}đ
        </span>
        
      </div>
    </div>

    {/* Nóm nút bấm: Tăng kích thước chiều cao để dễ bấm hơn */}
    <div className="flex items-center">
      <ButtonSubmit
        label={isSubmitting ? "Đang xử lý..." : (initialData ? "Cập nhật" : "Thêm vào giỏ")}
        onClick={handleConfirm}
        disabled={!sizeSelected || isSubmitting}
        className="h-12 px-8 rounded-xl bg-primary text-white text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-30"
      >
        {!isSubmitting && <ShoppingBag className="w-4 h-4 " />}
      </ButtonSubmit>
    </div>
  </div>
</div>
            </div>
        </div>
    );
};

export default AdminToppingModal;