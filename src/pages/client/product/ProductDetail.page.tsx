import { useParams } from "react-router-dom";
import PRODUCTS from "../../../mocks/Mock.Product";
import ProductSpecification from "../../../components/Client/Product/ProductSpecification";
import ProductCard from "../../../components/Client/Product/ProductCard";

const ProductDetailPage = () => {
    const { productId } = useParams<{ productId: string }>();
    const products = PRODUCTS;
    const product = products.find(p => p.id === productId);

    const stockStatus=(status:boolean | undefined) =>{
        switch(status){
            case false:
                return <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                            Còn hàng
                        </span>
            case true:
                return <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <span className="material-symbols-outlined text-lg">cancel</span>
                            Hết hàng
                        </span>
                        // ádfafdas
        }
    } ;

    const moneyFormat = (amount: number) => {
    return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  }

console.log("object", product?.isOutOfStock);
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-10 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="flex flex-col gap-4">
          <div className="aspect-square w-full rounded-xl overflow-hidden bg-white dark:bg-[#3a3022] border border-[#f4f3f0] dark:border-[#3a3022]">
            <div
              className="w-full h-full bg-center bg-no-repeat bg-cover"
              style={{ backgroundImage: `url(${product?.image})` }}
            ></div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="mb-6">
            <h1 className="text-[#181511] dark:text-white text-4xl font-black leading-tight tracking-tight mb-2">
              {product?.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-clay dark:text-[#a5947d]">
              <span>
                Mã SP: <span className="font-semibold">{product?.id}</span>
              </span>
              <span className="w-px h-4 bg-[#f4f3f0] dark:bg-[#3a3022]"></span>
              {stockStatus(product?.isOutOfStock)}
            </div>
          </div>
          <div className="mb-8 p-6 bg-primary/5 dark:bg-primary/10 rounded-xl">
            <h2 className="text-primary text-3xl font-bold leading-tight">
              {moneyFormat(product?.price || 0)}
              <span className="text-base font-normal text-clay dark:text-[#a5947d]">
                {product?.unit}
              </span>
            </h2>
            <p className="text-sm mt-1 text-clay dark:text-[#a5947d]">
              Giá đã bao gồm thuế VAT và phí vận chuyển nhượng quyền
            </p>
          </div>
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3">Mô tả sản phẩm</h3>
            <p className="text-clay dark:text-[#a5947d] leading-relaxed">
              {product?.description}
            </p>
          </div>
          {product && (
            <div className="mb-8 border-t border-b border-[#f4f3f0] dark:border-[#3a3022] py-6">
              <h3 className="text-lg font-bold mb-4">Thông số kỹ thuật</h3>
              <ProductSpecification product={product} />
            </div>
          )}
          <div className="flex items-end gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">
                Số lượng ({product?.unit})
              </span>
              <div className="flex items-center border border-[#f4f3f0] dark:border-[#3a3022] rounded-lg bg-white dark:bg-[#3a3022] h-14 w-32">
                <button className="cursor-pointer w-10 h-full flex items-center justify-center hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <input
                  title="quantity"
                  className="w-12 text-center bg-transparent border-none focus:ring-0 font-bold text-lg"
                  type="text"
                  value={1}
                />
                <button className="cursor-pointer w-10 h-full flex items-center justify-center hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
            <button className="cursor-pointer flex-1 h-14 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined">shopping_cart</span>
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Sản phẩm khác</h2>
            <a className="text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer">Xem tất cả             
            </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {PRODUCTS.slice(0,4).map((item) => (
                <ProductCard key={item.id} item={item} />
            ))}
        </div>
      </section>
    </div>
  );
}


export default ProductDetailPage