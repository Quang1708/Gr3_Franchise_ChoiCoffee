import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ProductDetail } from "./models/product.models";
import { getPublicDetailProduct } from "./services/product.service";
import ClientLoading from "@/components/Client/Client.Loading";
import { toast } from "react-toastify";
import { useCustomerAuthStore } from "@/stores/customerAuth.store";
import ToppingModal from "@/components/Client/Product/Topping.Modal";
import ROUTER_URL from "@/routes/router.const";
// import ProductCard from "../../../components/Client/Product/ProductCard";

const ProductDetailPage = () => {
  const CONTENT_COLLAPSED_HEIGHT_PX = 120;
  const navigate = useNavigate();
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
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [hasLongContent, setHasLongContent] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(CONTENT_COLLAPSED_HEIGHT_PX);
  const contentFrameRef = useRef<HTMLIFrameElement | null>(null);
  const { customer } = useCustomerAuthStore();
  const availableSizes =
    product?.sizes?.filter((size) => size.is_available) || [];
  const firstAvailableSize = availableSizes[0];

  const contentSrcDoc = useMemo(() => {
    if (!product?.content) {
      return "";
    }

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: transparent;
      }

      img, video, iframe, table {
        max-width: 100%;
      }

      table {
        display: block;
        overflow-x: auto;
      }
    </style>
  </head>
  <body>${product.content}</body>
</html>`;
  }, [product?.content]);

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

  useEffect(() => {
    setIsContentExpanded(false);
    setHasLongContent(false);
    setIframeHeight(CONTENT_COLLAPSED_HEIGHT_PX);
  }, [product?.content]);

  const handleContentFrameLoad = () => {
    const frame = contentFrameRef.current;
    const contentDocument = frame?.contentDocument;
    if (!frame || !contentDocument) return;

    const nextHeight = Math.max(
      contentDocument.documentElement.scrollHeight,
      contentDocument.body.scrollHeight,
    );

    if (nextHeight > 0) {
      setIframeHeight(nextHeight);
      setHasLongContent(nextHeight > CONTENT_COLLAPSED_HEIGHT_PX + 1);
    }
  };

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

  const handleGoBackToProducts = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(ROUTER_URL.MENU);
  };

  if (isLoading) {
    return <ClientLoading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
      <button
        type="button"
        onClick={handleGoBackToProducts}
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-[#f4f3f0] dark:border-[#3a3022] bg-white/80 dark:bg-[#2c241a] px-4 py-2 text-sm font-semibold text-[#181511] dark:text-white hover:bg-white dark:hover:bg-[#3a3022] transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-[20px]">
          arrow_back
        </span>
        Quay lại sản phẩm
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16">
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
          <div className="flex sm:flex-col gap-2 sm:gap-4 w-full sm:w-24 lg:w-32">
            <button
              onClick={handleUp}
              // disabled={startIndex === 0}
              className="hidden sm:block mb-2 p-1 text-slate-700 disabled:opacity-20 hover:bg-slate-100 rounded-full transition-all cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined rounded-full">
                expand_less
              </span>
            </button>

            <div className="flex sm:flex-col gap-2 sm:gap-4 overflow-x-auto sm:overflow-hidden w-full hide-scrollbar">
              {allImages
                .slice(startIndex, startIndex + VISIBLE_COUNT)
                .map((url, index) => {
                  const actualIndex = startIndex + index;
                  return (
                    <div
                      key={actualIndex}
                      onClick={() => setSelectedImage(url || "")}
                      className={`aspect-square w-18 sm:w-full shrink-0 rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
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
              className="hidden sm:block mt-2 p-1 text-slate-700 disabled:opacity-20 hover:bg-slate-100 rounded-full transition-all cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>
          <div className="flex-1 aspect-square rounded-xl overflow-hidden bg-white dark:bg-[#3a3022] border border-[#f4f3f0] dark:border-[#3a3022] min-h-60">
            <div
              className="w-full h-full bg-center bg-no-repeat bg-cover"
              style={{ backgroundImage: `url(${selectedImage})` }}
            ></div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="mb-6">
            <h1 className="text-[#181511] dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-tight mb-2">
              {product?.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-clay dark:text-[#a5947d]">
              <span>
                Mã SP: <span className="font-semibold">{product?.SKU}</span>
              </span>
              <span className="w-px h-4 bg-[#f4f3f0] dark:bg-[#3a3022]"></span>
            </div>
          </div>
          <div className="mb-8 p-4 sm:p-6 bg-primary/5 dark:bg-primary/10 rounded-xl">
            <h2 className="text-primary text-2xl sm:text-3xl font-bold leading-tight">
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
              className={`flex-1 h-12 sm:h-14 font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-base sm:text-lg shadow-lg shadow-primary/20 ${
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
      <section className="mb-14 sm:mb-20">
        {contentSrcDoc && (
          <div>
            <div
              className={`product-content-wrapper ${
                isContentExpanded ? "" : "product-content-collapsed"
              }`}
              style={
                isContentExpanded
                  ? { maxHeight: `${iframeHeight}px` }
                  : { maxHeight: `${CONTENT_COLLAPSED_HEIGHT_PX}px` }
              }
            >
              <iframe
                ref={contentFrameRef}
                title="Product content"
                srcDoc={contentSrcDoc}
                onLoad={handleContentFrameLoad}
                className="product-content-iframe w-full border-0 block"
                style={{ height: `${iframeHeight}px` }}
              ></iframe>
            </div>
            {hasLongContent && (
              <button
                type="button"
                onClick={() => setIsContentExpanded((prev) => !prev)}
                className="mt-3 inline-flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer"
              >
                {isContentExpanded ? "Thu gọn" : "Xem thêm"}
                <span className="material-symbols-outlined text-[20px]!">
                  {isContentExpanded ? "expand_less" : "expand_more"}
                </span>
              </button>
            )}
          </div>
        )}
      </section>
      <section className="mb-14 sm:mb-20">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Sản phẩm khác
          </h2>
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
