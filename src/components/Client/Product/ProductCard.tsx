import type { Product } from "@/models/product.model";
import { useState } from "react";
import { toast } from "react-toastify";
import ToppingModal from "./Topping.Modal";

type ProductCardProps = {
  item: Product;
};

const ProductCard = ({ item }: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleAddToCart = (product: Product) => {    
    toast.success(`${product.name} đã được thêm vào giỏ hàng!`);
    setIsModalOpen(false); 
  };

  return (
    <>
    
    <div className="swiper-slide h-full">
      <div className="group h-full bg-white border border-charcoal rounded-xl overflow-hidden flex flex-col relative">

        <div className="absolute top-4 left-4 z-10 space-y-2 pointer-events-none">
          <div className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full">
            Hot
          </div>
          <div className="bg-charcoal text-white text-[10px] font-bold px-3 py-1 rounded-full">
            Mới
          </div>
        </div>     
        <div className="relative overflow-hidden">
          <div className="aspect-4/5">
            <img
              src={item.img}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>          
        </div>

        <div className="flex flex-col flex-1 text-center px-4 py-5">
          <h3 className="font-heading font-bold text-charcoal text-base line-clamp-2 min-h-12">
            {item.name}
          </h3>
          <div className="mt-auto">
            <span className="text-charcoal font-semibold text-sm">
              Giá từ:
            </span>
            <div className="text-lg font-bold text-primary">
              {item.minPrice.toLocaleString()} VND
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!item.isActive}
            className={`
              cursor-pointer
              absolute inset-x-0 bottom-0 h-12
              flex items-center justify-center gap-2
              text-sm font-bold
              transition-all duration-300
              ${
                item.isActive
                  ? "bg-primary text-white translate-y-full group-hover:translate-y-0"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            <span className="material-symbols-outlined">add_shopping_cart</span>
            Thêm vào giỏ hàng
            <i className="fa-solid fa-basket-shopping"></i>
          </button>
        </div>
      </div>
      <ToppingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleAddToCart}
        product={item}
      />
    </div>
    </>
  );
};

export default ProductCard;
