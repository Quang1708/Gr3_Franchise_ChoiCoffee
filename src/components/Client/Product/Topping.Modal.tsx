import { useState, useEffect } from "react";
import type { Product } from "./models/product.model";
import { getPublicProducts } from "./services/product.service";
import { getToppingCategoryId } from "./utils/category.util";
import ButtonSubmit from "../Button/ButtonSubmit";
import ClientLoading from "../Client.Loading";
import { useCustomerAuthStore } from "@/stores/customerAuth.store";
import { toast } from "react-toastify";
import type { AddCartRequest } from "./models/addCart.model";
import { addItemToCart } from "./services/cart02.service";
import type { ProductDetail } from "@/pages/client/product/models/product.models";

const MAX_ITEMS = 10;

type Sizes = {
  product_franchise_id: string;
  size: string;
  price: number;
  is_available: boolean;
};

type ProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | ProductDetail;
};

const ToppingModal = ({ isOpen, onClose, product }: ProductModalProps) => {
  const [toppings, setToppings] = useState<Product[] | null>([]);
  const toppingId = getToppingCategoryId();
  const franchiseId = localStorage.getItem("selectedFranchise") || "";
  const [sizeSelected, setSizeSelected] = useState<Sizes | null>(null);
  const [quantitySelected, setQuantitySelected] = useState<number>(1);
  const [toppingSelected, setToppingSelected] = useState<
    Record<string, number>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const { customer } = useCustomerAuthStore();
  const [note, setNote] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const availableSizes =
    product?.sizes?.filter((size) => size.is_available) || [];

  useEffect(() => {
    if (!isOpen || !product) return;

    let isMounted = true;
    setIsModalLoading(true);

    const fetchToppings = async () => {
      try {
        if (!toppingId) {
          setToppings([]);
          return;
        }

        const response = await getPublicProducts(franchiseId, toppingId);
        if (response && isMounted) {
          setToppings(response);
        }
      } catch (error) {
        console.error("Error fetching toppings:", error);
        if (isMounted) setToppings([]);
      } finally {
        if (isMounted) setIsModalLoading(false);
      }
    };

    fetchToppings();

    return () => {
      isMounted = false;
    };
  }, [isOpen, product, toppingId, franchiseId]);

  useEffect(() => {
    if (!isOpen || !product) return;

    const firstAvailableSize =
      product.sizes?.find((size) => size.is_available) || null;
    setSizeSelected(firstAvailableSize);
    setQuantitySelected(1);
    setToppingSelected({});
    setNote("");
    setMessage("");
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const formattedOptions = (toppings || [])
    .filter((topping) => (toppingSelected[topping.product_id] || 0) > 0)
    .map((topping) => ({
      product_franchise_id:
        topping.sizes?.find((size) => size.is_available)
          ?.product_franchise_id ||
        topping.sizes?.[0]?.product_franchise_id ||
        "",
      quantity: toppingSelected[topping.product_id],
    }));

  const payload: AddCartRequest = {
    franchise_id: franchiseId,
    product_franchise_id: sizeSelected?.product_franchise_id || "",
    quantity: quantitySelected,
    address: customer?.address || "",
    phone: customer?.phone || "",
    note: note || "",
    message: message || "",
    options: formattedOptions,
  };

  const handleConfirm = async () => {
    if (!sizeSelected || !sizeSelected.is_available) {
      toast.error("Vui lòng chọn size còn hàng!");
      return;
    }
    if (!franchiseId) {
      toast.error("Vui lòng chọn cửa hàng!");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await addItemToCart(payload);
      if (response) {
        toast.success("Sản phẩm đã được thêm vào giỏ hàng!");
        window.dispatchEvent(new Event("cartUpdated"));
        onClose();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng!");
      console.error("Error adding item to cart:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSelectedCount = Object.values(toppingSelected).reduce(
    (sum, count) => sum + count,
    0,
  );

  const sizePrice = sizeSelected?.price || 0;

  const toppingsPrice = (toppings || []).reduce((sum, topping) => {
    const count = toppingSelected[topping.product_id] || 0;
    return sum + count * (topping.sizes?.[0]?.price || 0);
  }, 0);

  const unitPrice = sizePrice + toppingsPrice;
  const totalPrice = unitPrice * quantitySelected;

  const handleIncreaseTopping = (id: string) => {
    if (totalSelectedCount < MAX_ITEMS) {
      setToppingSelected((prev) => ({
        ...prev,
        [id]: (prev[id] || 0) + 1,
      }));
    }
  };

  const handleDecreaseTopping = (id: string) => {
    if (toppingSelected[id] && toppingSelected[id] > 0) {
      setToppingSelected((prev) => ({
        ...prev,
        [id]: prev[id] - 1,
      }));
    }
  };
  const handleIncreaseProduct = () => setQuantitySelected((prev) => prev + 1);
  const handleDecreaseProduct = () =>
    setQuantitySelected((prev) => Math.max(1, prev - 1));

  const handleClose = () => {
    onClose();
  };

  // const handleConfirm = () => {
  //   if (!selectedSize) return;

  //   const selectedToppings = Object.fromEntries(
  //     Object.entries(quantities).filter(([, count]) => count > 0)
  //   );

  // };

  return (
    <>
      {isSubmitting && (
        <div className="fixed inset-0 z-70 bg-white/80 dark:bg-charcoal/80 backdrop-blur-[1px] flex items-center justify-center">
          <ClientLoading />
        </div>
      )}

      <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
        <div
          className="bg-white dark:bg-charcoal rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] relative"
          onClick={(e) => e.stopPropagation()}
        >
          {isModalLoading && (
            <div className="absolute inset-0 z-20 bg-white/80 dark:bg-charcoal/80 backdrop-blur-[1px] flex items-center justify-center">
              <ClientLoading />
            </div>
          )}

          {/* --- HEADER TỔNG HỢP (Hình ảnh + Thông tin + Nút Tắt) --- */}
          <div className="relative shrink-0 bg-linear-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 border-b border-gray-100 dark:border-white/10 p-5">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 hover:bg-white dark:bg-charcoal/80 dark:hover:bg-charcoal text-gray-600 dark:text-white/70 shadow-sm transition-all hover:rotate-90 duration-300 backdrop-blur-md"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="flex gap-4 items-center pr-8">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-md ring-2 ring-white dark:ring-white/10 shrink-0 bg-white">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-1.5 truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {product.description ||
                    "Tùy chỉnh sản phẩm theo ý thích của bạn"}
                </p>
              </div>
            </div>
          </div>

          {/* --- BODY CUỘN ĐƯỢC --- */}
          <div className="p-5 overflow-y-auto flex-1 custom-scroll bg-gray-50/50 dark:bg-background-dark/30 space-y-6">
            {/* Section: Size */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="bg-white dark:bg-white/5 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                <div className="mb-4">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                    Chọn Size <span className="text-red-500">*</span>
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Vui lòng chọn 1 kích cỡ
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {product.sizes.map((size: Sizes) => (
                    <button
                      key={size.size}
                      onClick={() => {
                        if (!size.is_available) return;
                        setSizeSelected(size);
                      }}
                      disabled={!size.is_available}
                      className={`group relative p-3 rounded-xl border-2 transition-all duration-300
                      ${
                        sizeSelected?.size === size.size
                          ? "border-amber-500 bg-amber-50/50 dark:bg-amber-900/20 shadow-sm"
                          : "border-gray-200 dark:border-white/10 bg-white dark:bg-transparent"
                      }
                      ${size.is_available ? "hover:shadow-md hover:-translate-y-1 hover:border-amber-300 cursor-pointer" : "opacity-60 cursor-not-allowed"}
                    `}
                    >
                      {sizeSelected?.size === size.size && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                          <span className="material-symbols-outlined text-white text-sm">
                            check
                          </span>
                        </div>
                      )}
                      <div
                        className={`text-center font-bold text-base mb-1 ${
                          sizeSelected?.size === size.size
                            ? "text-amber-700 dark:text-amber-400"
                            : "text-gray-700 dark:text-white"
                        } ${!size.is_available ? "line-through decoration-2" : ""}`}
                      >
                        {size.size}
                      </div>
                      <div
                        className={`text-sm font-semibold text-center ${
                          sizeSelected?.size === size.size
                            ? "text-amber-600 dark:text-amber-500"
                            : "text-gray-500 dark:text-gray-400"
                        } ${!size.is_available ? "line-through decoration-2" : ""}`}
                      >
                        {size.price.toLocaleString()}đ
                      </div>
                      {!size.is_available && (
                        <div className="mt-1 text-[11px] text-center font-semibold text-red-500">
                          Hết hàng
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {availableSizes.length === 0 && (
                  <p className="mt-3 text-sm font-medium text-red-500">
                    Sản phẩm hiện đã hết hàng.
                  </p>
                )}
              </div>
            )}

            {/* Section: Topping */}
            {product.is_have_topping && (
              <div className="bg-white dark:bg-white/5 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                      Thêm Topping
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Tối đa {MAX_ITEMS} món
                    </p>
                  </div>
                  {totalSelectedCount > 0 && (
                    <div className="px-3 py-1 rounded-full border border-amber-200 bg-amber-50 dark:bg-amber-900/30 dark:border-amber-700/50 text-amber-700 dark:text-amber-400 text-sm font-bold shadow-sm">
                      Đã chọn: {totalSelectedCount}/{MAX_ITEMS}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(toppings || []).map((topping) => {
                    const currentCount =
                      toppingSelected[topping.product_id] || 0;
                    const isSelected = currentCount > 0;
                    const toppingAvailableSize = topping.sizes?.find(
                      (size) => size.is_available,
                    );
                    const isToppingAvailable = Boolean(toppingAvailableSize);

                    return (
                      <div
                        key={topping.product_id}
                        className={`group flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all duration-300 ${
                          isSelected && isToppingAvailable
                            ? "border-amber-500 bg-amber-50/30 dark:bg-amber-900/10 shadow-sm"
                            : "border-gray-100 dark:border-white/10 bg-white dark:bg-transparent"
                        }`}
                      >
                        {/* Topping Image */}
                        <div
                          className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden ${
                            isSelected
                              ? "ring-2 ring-amber-400"
                              : "ring-1 ring-gray-200 dark:ring-white/10"
                          }`}
                        >
                          <img
                            src={topping.image_url}
                            alt={topping.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>

                        <div className="flex flex-col flex-1 min-w-0 py-0.5">
                          <h5
                            className={`font-bold text-sm truncate mb-0.5 ${
                              isSelected && isToppingAvailable
                                ? "text-amber-700 dark:text-amber-400"
                                : "text-gray-800 dark:text-white"
                            } ${!isToppingAvailable ? "line-through decoration-2 opacity-60" : ""}`}
                          >
                            {topping.name}
                          </h5>
                          <div
                            className={`text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 ${
                              !isToppingAvailable
                                ? "line-through decoration-2 opacity-60"
                                : ""
                            }`}
                          >
                            +
                            {(
                              toppingAvailableSize?.price ||
                              topping.sizes?.[0]?.price ||
                              0
                            ).toLocaleString()}
                            đ
                          </div>
                          {!isToppingAvailable && (
                            <div className="text-[11px] mb-2 font-semibold text-red-500">
                              Hết hàng
                            </div>
                          )}

                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 mt-auto">
                            <button
                              onClick={() =>
                                handleDecreaseTopping(topping.product_id)
                              }
                              disabled={
                                !isToppingAvailable || currentCount === 0
                              }
                              className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${
                                !isToppingAvailable || currentCount === 0
                                  ? "opacity-30 cursor-not-allowed bg-gray-100 dark:bg-white/5"
                                  : "bg-gray-100 dark:bg-white/10 shadow-sm hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:text-amber-600 active:scale-95 text-gray-700 dark:text-white"
                              }`}
                            >
                              <span className="material-symbols-outlined text-base">
                                remove
                              </span>
                            </button>

                            <div
                              className={`w-6 text-center font-bold text-sm ${
                                isSelected
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {currentCount}
                            </div>

                            <button
                              onClick={() =>
                                handleIncreaseTopping(topping.product_id)
                              }
                              disabled={
                                !isToppingAvailable ||
                                totalSelectedCount >= MAX_ITEMS
                              }
                              className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${
                                !isToppingAvailable ||
                                totalSelectedCount >= MAX_ITEMS
                                  ? "opacity-30 cursor-not-allowed bg-gray-100 dark:bg-white/5"
                                  : "bg-amber-50 dark:bg-amber-900/20 shadow-sm hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-600 dark:text-amber-400 active:scale-95"
                              }`}
                            >
                              <span className="material-symbols-outlined text-base">
                                add
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="bg-white dark:bg-white/5 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
              <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                Thông tin bổ sung
              </h4>

              <div className="space-y-4">
                {/* Input Ghi chú */}
                <div>
                  <label
                    htmlFor="note"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Ghi chú cho quán (Tùy chọn)
                  </label>
                  <textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="VD: Ít đá, nhiều đường..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none h-20 text-sm"
                  />
                </div>

                {/* Input Lời nhắn */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Lời nhắn (Tùy chọn)
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="VD: Chúc shipper một ngày tốt lành..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none h-20 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- FOOTER (Tổng kết & Action) --- */}
          <div className="shrink-0 bg-white dark:bg-charcoal border-t border-gray-100 dark:border-white/10 p-4 sm:p-5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              {/* Control Số lượng sản phẩm */}
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Số lượng
                </span>
                <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 rounded-xl p-1 border border-gray-100 dark:border-white/10">
                  <button
                    onClick={handleDecreaseProduct}
                    disabled={quantitySelected <= 1}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                      quantitySelected <= 1
                        ? "opacity-40 cursor-not-allowed text-gray-400"
                        : "bg-white dark:bg-charcoal shadow-sm hover:shadow-md hover:scale-105 active:scale-95 text-gray-700 dark:text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">
                      remove
                    </span>
                  </button>

                  <div className="w-12 text-center">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {quantitySelected}
                    </span>
                  </div>

                  <button
                    onClick={handleIncreaseProduct}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-charcoal shadow-sm hover:shadow-md hover:scale-105 active:scale-95 text-gray-700 dark:text-white transition-all"
                  >
                    <span className="material-symbols-outlined text-xl">
                      add
                    </span>
                  </button>
                </div>
              </div>

              {/* Tổng tiền */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:mb-1">
                  Tổng tạm tính
                </span>
                <span className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {totalPrice.toLocaleString()}đ
                </span>
              </div>
            </div>

            {/* Nút Action */}
            <div className="flex gap-3 mt-2">
              <button
                onClick={handleClose}
                className="w-1/3 sm:w-1/4 py-3.5 rounded-xl font-bold border-2 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 transition-all duration-200 active:scale-95"
              >
                Hủy
              </button>
              <div className="flex-1">
                <ButtonSubmit
                  label="Thêm vào giỏ hàng"
                  onClick={handleConfirm}
                  disabled={
                    !sizeSelected || !sizeSelected?.is_available || isSubmitting
                  }
                  className="w-full h-full py-3.5 rounded-xl text-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ToppingModal;
