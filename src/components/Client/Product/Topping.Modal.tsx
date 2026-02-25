import { useState } from "react";
import type { Product } from "@/models/product.model";
import ButtonSubmit from "../Button/ButtonSubmit";

const MOCK_TOPPINGS = [
  {
    id: "tp1",
    name: "Trân châu đen hoàng kim",
    price: 10000,
    img: "https://placehold.co/100x100/png?text=TranChauDen",
  },
  {
    id: "tp2",
    name: "Trân châu trắng 3Q giòn",
    price: 12000,
    img: "https://placehold.co/100x100/png?text=TranChauTrang",
  },
  {
    id: "tp3",
    name: "Thạch sương sáo thảo mộc",
    price: 10000,
    img: "https://placehold.co/100x100/png?text=SuongSao",
  },
  {
    id: "tp4",
    name: "Pudding trứng caramen",
    price: 12000,
    img: "https://placehold.co/100x100/png?text=Pudding",
  },
  {
    id: "tp5",
    name: "Kem Cheese mặn",
    price: 15000,
    img: "https://placehold.co/100x100/png?text=KemCheese",
  },
  {
    id: "tp6",
    name: "Thạch dừa non thái sợi",
    price: 8000,
    img: "https://placehold.co/100x100/png?text=ThachDua",
  },
  {
    id: "tp7",
    name: "Nha đam tươi",
    price: 10000,
    img: "https://placehold.co/100x100/png?text=NhaDam",
  },
  {
    id: "tp8",
    name: "Đậu đỏ Azuki Nhật Bản",
    price: 12000,
    img: "https://placehold.co/100x100/png?text=DauDo",
  },
];

const MAX_ITEMS = 3;

type ToppingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    product: Product,
    selectedToppings: string[],
    totalPrice: number,
  ) => void;
  product: Product;
};

const ToppingModal = ({
  isOpen,
  onClose,
  onConfirm,
  product,
}: ToppingModalProps) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const totalSelectedCount = Object.values(quantities).reduce(
    (sum, count) => sum + count,
    0,
  );
  if (!isOpen) return null;

  const toppingsPrice = MOCK_TOPPINGS.reduce((sum, topping) => {
    const count = quantities[topping.id] || 0;
    return sum + count * topping.price;
  }, 0);

  const totalPrice = product.minPrice + toppingsPrice;

  const handleIncrease = (id: string) => {
    if (totalSelectedCount < MAX_ITEMS) {
      setQuantities((prev) => ({
        ...prev,
        [id]: (prev[id] || 0) + 1,
      }));
    }
  };

  const handleDecrease = (id: string) => {
    if (quantities[id] && quantities[id] > 0) {
      setQuantities((prev) => ({
        ...prev,
        [id]: prev[id] - 1,
      }));
    }
  };

  const handleClose = () => {
    setQuantities({});
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(product, quantities, totalPrice);
    setQuantities({});
  };

  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
      <div
        className="bg-[#fcfaf7] dark:bg-background-dark rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 bg-white dark:bg-charcoal border-b border-charcoal/10 dark:border-white/10 shrink-0">
          <h3 className="font-bold text-xl text-[#0b2b4d] dark:text-white">
            Chọn topping cho {product.name}
          </h3>
          <button
            onClick={handleClose}
            className="text-charcoal/50 hover:text-charcoal dark:text-white/50 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-[#fcfaf7] dark:bg-background-dark">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_TOPPINGS.map((topping) => {
              const currentCount = quantities[topping.id] || 0;

              return (
                <div
                  key={topping.id}
                  className="flex gap-4 p-4 bg-white dark:bg-charcoal rounded-2xl border border-charcoal/5 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src={topping.img}
                      alt={topping.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col flex-1 justify-between py-1">
                    <div>
                      <h4 className="font-bold text-[15px] text-[#0b2b4d] dark:text-white line-clamp-2">
                        {topping.name}
                      </h4>

                      <p className="text-primary text-sm font-semibold mt-1">
                        +{topping.price.toLocaleString()}đ
                      </p>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDecrease(topping.id)}
                          disabled={currentCount === 0}
                          className={`w-9 h-9 flex items-center justify-center rounded bg-gray-50 dark:bg-white/10 text-gray-500 dark:text-white transition-colors
                            ${currentCount === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-white/20 hover:text-charcoal cursor-pointer"}
                          `}
                        >
                          <span className="material-symbols-outlined text-xl">
                            remove
                          </span>
                        </button>

                        <div className="w-10 text-center font-bold text-lg text-charcoal dark:text-white">
                          {currentCount}
                        </div>

                        <button
                          onClick={() => handleIncrease(topping.id)}
                          disabled={totalSelectedCount >= MAX_ITEMS}
                          className={`w-9 h-9 flex items-center justify-center rounded bg-gray-50 dark:bg-white/10 text-gray-500 dark:text-white transition-colors
                            ${totalSelectedCount >= MAX_ITEMS ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-white/20 hover:text-charcoal cursor-pointer"}
                          `}
                        >
                          <span className="material-symbols-outlined text-xl">
                            add
                          </span>
                        </button>
                      </div>

                      <div className="text-right mt-1 pr-1">
                        <span className="text-[11px] text-gray-400 italic">
                          / {MAX_ITEMS} tối đa
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 border-t border-charcoal/10 dark:border-white/10 bg-white dark:bg-charcoal shrink-0">
          
          <div className="flex justify-between items-end mb-5 px-1">
            <span className="text-charcoal/80 dark:text-white/80 text-base font-semibold">
              Tạm tính:
              <span className="block text-sm font-normal text-charcoal/50 dark:text-white/50 mt-0.5">
                Đã chọn {totalSelectedCount} topping
              </span>
            </span>
            <span className="text-2xl font-bold text-primary">
              {totalPrice.toLocaleString()} VND
            </span>
          </div>

          
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="w-1/3 py-3.5 rounded-xl font-semibold border border-charcoal/20 text-charcoal hover:bg-charcoal/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10 transition-all duration-200"
            >
              Hủy
            </button>
            <ButtonSubmit
              label={"Thêm vào giỏ"}
              onClick={handleConfirm}
              className="w-2/3 py-3.5 rounded-xl font-bold text-white shadow-md shadow-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToppingModal;
