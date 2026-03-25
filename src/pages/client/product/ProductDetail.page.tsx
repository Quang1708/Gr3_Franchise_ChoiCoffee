import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { ProductDetail } from "./models/product.models";
import { getPublicDetailProduct } from "./services/product.service";
import ClientLoading from "@/components/Client/Client.Loading";
import { toast } from "react-toastify";
import { useCustomerAuthStore } from "@/stores/customerAuth.store";
import ToppingModal from "@/components/Client/Product/Topping.Modal";
// import ProductCard from "../../../components/Client/Product/ProductCard";

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<ProductDetail>();
  const franchiseId = localStorage.getItem("selectedFranchise");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const allImages = [product?.image_url, ...(product?.images_url || [])].filter(
    (url) => url,
  );
  const VISIBLE_COUNT = 4;
  const [startIndex, setStartIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { customer } = useCustomerAuthStore();
  const availableSizes =
    product?.sizes?.filter((size) => size.is_available) || [];
  const firstAvailableSize = availableSizes[0];

  useEffect(() => {
    const fetchDetailProduct = async () => {
      setIsLoading(true);
      if (franchiseId && productId) {
        try {
          const response = await getPublicDetailProduct(franchiseId, productId);
          if (response) {
            setIsLoading(false);
            setProduct(response);
            setSelectedImage(response.image_url || "");
          }
        } catch (error) {
          console.error("Error fetching product detail:", error);
          setIsLoading(false);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchDetailProduct();
  }, [franchiseId, productId]);

  const handleUp = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleDown = () => {
    setStartIndex((prev) =>
      Math.min(allImages.length - VISIBLE_COUNT, prev + 1),
    );
  };

  const handleCartButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firstAvailableSize) {
      toast.error("Sản phẩm hiện đang hết hàng!");
      return;
    }
    if (!customer) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <ClientLoading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-10 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-4 w-32">
            <button
              onClick={handleUp}
              // disabled={startIndex === 0}
              className="mb-2 p-1 text-slate-700 disabled:opacity-20 hover:bg-slate-100 rounded-full transition-all cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined rounded-full">
                expand_less
              </span>
            </button>

            <div className="flex flex-col gap-4 overflow-hidden w-full">
              {allImages
                .slice(startIndex, startIndex + VISIBLE_COUNT)
                .map((url, index) => {
                  const actualIndex = startIndex + index;
                  return (
                    <div
                      key={actualIndex}
                      onClick={() => setSelectedImage(url || "")}
                      className={`aspect-square w-full rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                        selectedImage === url
                          ? "border-primary shadow-md scale-105"
                          : "border-transparent hover:border-primary/40"
                      } bg-white dark:bg-[#3a3022]`}
                    >
                      <div
                        className="w-full h-full bg-center bg-no-repeat bg-cover"
                        style={{ backgroundImage: `url(${url})` }}
                      ></div>
                    </div>
                  );
                })}
            </div>

            <button
              onClick={handleDown}
              disabled={startIndex >= allImages.length - VISIBLE_COUNT}
              className="mt-2 p-1 text-slate-700 disabled:opacity-20 hover:bg-slate-100 rounded-full transition-all cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>
          <div className="flex-1 aspect-square rounded-xl overflow-hidden bg-white dark:bg-[#3a3022] border border-[#f4f3f0] dark:border-[#3a3022]">
            <div
              className="w-full h-full bg-center bg-no-repeat bg-cover"
              style={{ backgroundImage: `url(${selectedImage})` }}
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
                Mã SP: <span className="font-semibold">{product?.SKU}</span>
              </span>
              <span className="w-px h-4 bg-[#f4f3f0] dark:bg-[#3a3022]"></span>
            </div>
          </div>
          <div className="mb-8 p-6 bg-primary/5 dark:bg-primary/10 rounded-xl">
            <h2 className="text-primary text-3xl font-bold leading-tight">
              {firstAvailableSize
                ? `${firstAvailableSize.price.toLocaleString()} VND`
                : "Hết hàng"}
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
          {/* {product && (
            <div className="mb-8 border-t border-b border-[#f4f3f0] dark:border-[#3a3022] py-6">
              <h3 className="text-lg font-bold mb-4">Thông số kỹ thuật</h3>
              <ProductSpecification product={product} />
            </div>
          )} */}
          <div className="flex items-end mt-auto gap-4">
            {/* <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">
                Số lượng 
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
            </div> */}
            <button
              className={`flex-1 h-14 font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-primary/20 ${
                firstAvailableSize
                  ? "cursor-pointer bg-primary text-white hover:bg-primary/90"
                  : "cursor-not-allowed bg-gray-300 text-gray-500"
              }`}
              onClick={handleCartButtonClick}
              disabled={!firstAvailableSize}
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              {firstAvailableSize ? "Thêm vào giỏ hàng" : "Hết hàng"}
            </button>
          </div>
        </div>
      </div>
      <section className="mb-20">
        {product?.content && (
          <div className="prose max-w-none dark:prose-invert">
            <div
              className="product-content"
              dangerouslySetInnerHTML={{ __html: product.content }}
            ></div>
          </div>
        )}
      </section>
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Sản phẩm khác</h2>
          <a className="text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer">
            Xem tất cả
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* {PRODUCTS.slice(0,4).map((item) => (
                <ProductCard key={item.id} item={item} />
            ))} */}
        </div>
      </section>
      {product && (
        <ToppingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={product}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;
