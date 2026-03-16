import { useState, useEffect } from "react";
import type { Product } from "./models/product.model";
import { getPublicProducts } from "./services/product.service";
import { getToppingCategoryId } from "./utils/category.util";
import ButtonSubmit from "../Button/ButtonSubmit";

const MAX_ITEMS = 10;

type Sizes = {
  product_franchise_id: string;
  size: string;
  price: number;
  is_available: boolean;
}

type ProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    product: Product,
    selectedSize: Sizes,
    selectedToppings: Record<string, number>, // Trả về object chứa id và số lượng topping
    quantity: number, // Số lượng sản phẩm
    totalPrice: number,
  ) => void;
  product: Product;
};

const ToppingModal = ({
  isOpen,
  onClose,
  onConfirm,
  product,
}: ProductModalProps) => {
  const [toppings, setToppings] = useState<Product[] | null>([]);
  const [selectedSize, setSelectedSize] = useState<Sizes | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const toppingId = getToppingCategoryId();
  const franchiseId = localStorage.getItem("selectedFranchise") || "";

  useEffect (() => {
    const fetchToppings = async () => {
      try{
        const response = await getPublicProducts(
          franchiseId,
          toppingId || ""
        );
        if(response){
          setToppings(response);
        }
      }catch(error) {
        console.error("Error fetching toppings:", error);
        setToppings([]);
      }
    };
    if (toppingId) {
      fetchToppings();
    }
  }, [toppingId, franchiseId]);

  useEffect(() => {
    if (isOpen) {
      setSelectedSize(product.sizes?.[0] || null);
      setQuantities({});
      setProductQuantity(1);
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const totalSelectedCount = Object.values(quantities).reduce(
    (sum, count) => sum + count,
    0,
  );

  const sizePrice = selectedSize?.price || 0;

  const toppingsPrice = (toppings || []).reduce((sum, topping) => {
    const count = quantities[topping.product_id] || 0;
    return sum + count * (topping.sizes?.[0]?.price || 0);
  }, 0);

  const unitPrice = sizePrice + toppingsPrice;
  const totalPrice = unitPrice * productQuantity;

  const handleIncreaseTopping = (id: string) => {
    if (totalSelectedCount < MAX_ITEMS) {
      setQuantities((prev) => ({
        ...prev,
        [id]: (prev[id] || 0) + 1,
      }));
    }
  };

  const handleDecreaseTopping = (id: string) => {
    if (quantities[id] && quantities[id] > 0) {
      setQuantities((prev) => ({
        ...prev,
        [id]: prev[id] - 1,
      }));
    }
  };
  const handleIncreaseProduct = () => setProductQuantity((prev) => prev + 1);
  const handleDecreaseProduct = () => setProductQuantity((prev) => Math.max(1, prev - 1));

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    if (!selectedSize) return; 
    
    const selectedToppings = Object.fromEntries(
      Object.entries(quantities).filter(([, count]) => count > 0)
    );

    onConfirm(product, selectedSize, selectedToppings, productQuantity, totalPrice);
  };

  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="bg-linear-to-b from-white to-gray-50 dark:from-charcoal dark:to-background-dark rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-linear-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-900/20 dark:to-orange-900/20"></div>
          
          <div className="relative flex items-center gap-4 p-4 border-b border-gray-200 dark:border-white/10">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white dark:ring-charcoal shrink-0">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1 truncate">
                {product.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {product.description || "Tùy chỉnh sản phẩm theo ý thích của bạn"}
              </p>
            </div>

            
            <button
              onClick={handleClose}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-600 dark:text-white/70 transition-all hover:rotate-90 duration-300"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto flex-1 custom-scroll">
          
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                {/* <div className="w-7 h-7 rounded-lg bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-white text-lg">local_cafe</span>
                </div> */}
                <div>
                  <h4 className="font-bold text-base text-gray-900 dark:text-white">
                    Chọn Size
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Vui lòng chọn size phù hợp</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {product.sizes.map((size: Sizes) => (
                  <button
                    key={size.size}
                    onClick={() => setSelectedSize(size)}
                    className={`group relative p-3 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                      ${
                        selectedSize?.size === size.size
                          ? "border-amber-500 bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 shadow-md"
                          : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-amber-300"
                      }
                    `}
                  >
                    {selectedSize?.size === size.size && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                        <span className="material-symbols-outlined text-white text-sm">check</span>
                      </div>
                    )}
                    
                    {/* <div className="flex justify-center mb-1.5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        selectedSize?.size === size.size 
                          ? 'bg-amber-100 dark:bg-amber-900/30' 
                          : 'bg-gray-100 dark:bg-white/10 group-hover:bg-amber-50'
                      }`}>
                        <span className="material-symbols-outlined text-primary dark:text-primary">
                          {size.size}
                        </span>
                      </div>
                    </div> */}
                    
                    <div className={`text-center font-bold text-base mb-1 ${
                      selectedSize?.size === size.size 
                        ? 'text-amber-700 dark:text-amber-400' 
                        : 'text-gray-700 dark:text-white'
                    }`}>
                      {size.size}
                    </div>
                    <div className={`text-sm font-semibold ${
                      selectedSize?.size === size.size 
                        ? 'text-amber-600 dark:text-amber-500' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {size.price.toLocaleString()}đ
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {product.is_have_topping && (
            <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {/* <div className="w-7 h-7 rounded-lg bg-linear-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-white text-lg">cake</span>
                </div> */}
                <div>
                  <h4 className="font-bold text-base text-charcoal dark:text-white">
                    Thêm Topping
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Tối đa {MAX_ITEMS} topping</p>
                </div>
              </div>
              
              {totalSelectedCount > 0 && (
                <div className="px-3 py-1 rounded-full border-amber-500 bg-linear-to-br from-amber-50 to-orange-50 text-primary text-sm font-bold shadow-md">
                  {totalSelectedCount}/{MAX_ITEMS}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(toppings || []).map((topping) => {
                const currentCount = quantities[topping.product_id] || 0;
                const isSelected = currentCount > 0;

                return (
                  <div
                    key={topping.product_id}
                    className={`group relative flex gap-3 p-3 rounded-2xl border-2 transition-all duration-300 ${
                      isSelected
                        ? "border-amber-500 bg-linear-to-br from-amber-50 to-orange-50 dark:from-pink-900/10 dark:to-rose-900/10 shadow-md"
                        : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-amber-300 hover:shadow-lg"
                    }`}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-linear-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg z-10">
                        <span className="text-white text-xs font-bold">{currentCount}</span>
                      </div>
                    )}

                    {/* Topping Image */}
                    <div className={`relative w-16 h-16 shrink-0 rounded-xl overflow-hidden ${
                      isSelected ? 'ring-2 ring-amber-400' : 'ring-1 ring-gray-200 dark:ring-white/10'
                    }`}>
                      <img
                        src={topping.image_url}
                        alt={topping.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Price badge on image */}
                      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-1.5">
                        <span className="text-white text-xs font-bold">
                          +{(topping.sizes?.[0]?.price || 0).toLocaleString()}đ
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 justify-between">
                      {/* Topping name */}
                      <div>
                        <h5 className={`font-bold text-sm leading-tight line-clamp-2 mb-1 ${
                          isSelected 
                            ? 'text-amber-700 dark:text-amber-400' 
                            : 'text-gray-800 dark:text-white'
                        }`}>
                          {topping.name}
                        </h5>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 rounded-lg p-0.5">
                          <button
                            onClick={() => handleDecreaseTopping(topping.product_id)}
                            disabled={currentCount === 0}
                            className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${
                              currentCount === 0
                                ? "opacity-40 cursor-not-allowed"
                                : "bg-white dark:bg-charcoal shadow-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 active:scale-95"
                            }`}
                          >
                            <span className="material-symbols-outlined text-lg">remove</span>
                          </button>

                          <div className={`w-10 text-center font-bold text-lg ${
                            isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-white'
                          }`}>
                            {currentCount}
                          </div>

                          <button
                            onClick={() => handleIncreaseTopping(topping.product_id)}
                            disabled={totalSelectedCount >= MAX_ITEMS}
                            className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${
                              totalSelectedCount >= MAX_ITEMS
                                ? "opacity-40 cursor-not-allowed"
                                : "bg-white dark:bg-charcoal shadow-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 active:scale-95"
                            }`}
                          >
                            <span className="material-symbols-outlined text-lg">add</span>
                          </button>
                        </div>

                        {currentCount > 0 && (
                          <div className="text-right">
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">Tổng</span>
                            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                              {(currentCount * (topping.sizes?.[0]?.price || 0)).toLocaleString()}đ
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )}
          
        </div>
        <div className="shrink-0 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-charcoal">
          
          <div className="p-4 space-y-2.5">
            
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                  shopping_bag
                </span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Số lượng
                </span>
              </div>
              
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/10 rounded-xl p-1 shadow-inner">
                <button
                  onClick={handleDecreaseProduct}
                  disabled={productQuantity <= 1}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
                    productQuantity <= 1
                      ? "opacity-40 cursor-not-allowed"
                      : "bg-white dark:bg-charcoal shadow-sm hover:shadow-md hover:scale-105 active:scale-95 text-gray-700 dark:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">remove</span>
                </button>
                
                <div className="w-14 text-center">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {productQuantity}
                  </span>
                </div>
                
                <button
                  onClick={handleIncreaseProduct}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white dark:bg-charcoal shadow-sm hover:shadow-md hover:scale-105 active:scale-95 text-gray-700 dark:text-white transition-all"
                >
                  <span className="material-symbols-outlined text-xl">add</span>
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Giá size ({selectedSize?.size})</span>
                <span className="font-semibold">{sizePrice.toLocaleString()}đ</span>
              </div>
              {totalSelectedCount > 0 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Topping ({totalSelectedCount} món)</span>
                  <span className="font-semibold">+{toppingsPrice.toLocaleString()}đ</span>
                </div>
              )}
              {productQuantity > 1 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Số lượng</span>
                  <span className="font-semibold">x{productQuantity}</span>
                </div>
              )}
              <div className="border-t border-dashed border-gray-300 dark:border-white/10 pt-2"></div>
              
              {/* Total */}
              <div className="flex justify-between items-center pt-1">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Tổng cộng
                </span>
                <div className="text-right">
                  <span className="text-2xl font-bold bg-linear-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {totalPrice.toLocaleString()}đ
                  </span>
                  {totalSelectedCount > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Đã bao gồm topping
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3.5 rounded-xl font-semibold border-2 border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200 active:scale-95"
              >
                Hủy
              </button>
              <ButtonSubmit
                label="Thêm vào giỏ hàng"
                onClick={handleConfirm}
                disabled={!selectedSize}
                className="flex-2 py-3.5 rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToppingModal;