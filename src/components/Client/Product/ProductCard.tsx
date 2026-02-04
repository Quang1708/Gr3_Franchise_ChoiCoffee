import { useNavigate } from "react-router-dom";
import type { Product } from "./type";
import { toast } from "react-toastify";


type ProductCardProps = {
  item: Product;
};

const badgeLabelRender = (badge?: string | null) => {
    console.log(badge);
    switch(badge) {
        case "best-seller":
            return <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase z-10 shadow-sm">Bán chạy</div>
        case "out-of-stock":
            return <div className="absolute top-3 left-3 bg-clay text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase z-10 shadow-sm">Hết hàng</div>
        case "signature":
            return <div className="absolute top-3 left-3 bg-charcoal text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase z-10 shadow-sm">Signature</div>
        default:
            return null
    }
}

const ProductCard = ({item}: ProductCardProps) => {

  const addProduct = (product: Product) => {
    toast.success(`${product.name} đã được thêm vào giỏ hàng!`);
  }

  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/client/product/${item.id}`)}
      className="cursor-pointer flex flex-col bg-white dark:bg-background-dark rounded-xl overflow-hidden border border-charcoal/5 dark:border-white/5 hover:shadow-xl transition-all group"
    >
      <div className="relative aspect-4/5 w-full bg-background-light overflow-hidden">
        {badgeLabelRender(item.badge)}
        <div
          className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${item.image})` }}
        ></div>
        <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-charcoal hover:bg-primary hover:text-white transition-colors">
            <span className="material-symbols-outlined">visibility</span>
          </button>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <p className="text-clay text-[10px] font-bold uppercase tracking-wider">
            Mã: {item.id}
          </p>
          <h3 className="text-charcoal dark:text-white font-bold text-base line-clamp-2 leading-snug mt-1 min-h-12">
            {item.name}
          </h3>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <p className="text-primary font-extrabold text-lg leading-none">
              {item.price}
            </p>
            {item.originalPrice ? (
              <p className="text-sm text-charcoal/50 line-through">
                {item.originalPrice}
              </p>
            ) : (
              <p className="text-sm text-charcoal/50">-</p>
            )}
          </div>
          <span className="text-wood-brown text-[11px] font-medium">
            Kho: {item.stock} {item.unit}
          </span>
        </div>
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 mt-1"
        >
          <div className="flex items-center border border-charcoal/10 dark:border-white/10 rounded-lg overflow-hidden h-10 bg-background-light/50 dark:bg-white/5">
            <button className="px-2.5 text-charcoal dark:text-white hover:bg-charcoal/5">
              -
            </button>
            <input
              title="quantity"
              className="w-8 text-center border-none bg-transparent p-0 text-sm font-bold text-charcoal dark:text-white focus:ring-0"
              type="text"
              value="1"
            />
            <button className="px-2.5 text-charcoal dark:text-white hover:bg-charcoal/5">
              +
            </button>
          </div>
          <button
            title={item.stock === 0 ? "Sản phẩm đã hết hàng" : "add-to-cart"}
            onClick={() => addProduct(item)}
            disabled={item.stock === 0}
            className={`
    cursor-pointer flex-1 h-10 rounded-lg text-xs font-bold
    flex items-center justify-center gap-1 transition-all
    ${
      item.stock === 0
        ? "bg-slate-300 text-slate-500 cursor-not-allowed opacity-70"
        : "bg-charcoal dark:bg-white text-white dark:text-charcoal hover:bg-primary dark:hover:bg-primary dark:hover:text-white"
    }
  `}
          >
            <span className="material-symbols-outlined text-lg">
              {item.stock === 0 ? "remove_shopping_cart" : "add_shopping_cart"}
            </span>
            {item.stock === 0 ? "Hết hàng" : "Thêm vào giỏ"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard