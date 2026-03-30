import ProductCard from "./ProductCard";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import type { Product } from "./models/product.model";
import { getPublicProducts } from "./services/product.service";
import ClientLoading from "../Client.Loading";

type ProductListProps = {
  category: string;
  currentPage: number;
  onPageChange: (page: number) => void;
};

const ProductList = ({
  category,
  currentPage,
  onPageChange,
}: ProductListProps) => {
  const ITEMS_PER_PAGE = 8;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [franchiseId, setFranchiseId] = useState<string | null>(
    localStorage.getItem("selectedFranchise"),
  );

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 260);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen for franchise changes
  useEffect(() => {
    const handleStorageChange = () => {
      setFranchiseId(localStorage.getItem("selectedFranchise"));
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("franchiseChanged" as string, handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "franchiseChanged" as string,
        handleStorageChange,
      );
    };
  }, []);

  // Fetch products when franchiseId or category changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (!franchiseId || !category) return;

      setIsLoading(true);
      try {
        const response = await getPublicProducts(franchiseId, category);
        if (response) {
          setProducts(response);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [franchiseId, category]);

  // Hiển thị tất cả sản phẩm, không filter theo còn hàng
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > 1 && totalPages > 0 && currentPage > totalPages) {
      onPageChange(totalPages);
    }
  }, [currentPage, onPageChange, totalPages]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return <ClientLoading />;
  }

  const renderPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageClick(i)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${
              currentPage === i
                ? "bg-primary text-white"
                : "border border-charcoal/10 dark:border-white/10 text-charcoal dark:text-white hover:bg-primary hover:text-white"
            }`}
          >
            {i}
          </button>,
        );
      }
    } else {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageClick(1)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${
            currentPage === 1
              ? "bg-primary text-white"
              : "border border-charcoal/10 dark:border-white/10 text-charcoal dark:text-white hover:bg-primary hover:text-white"
          }`}
        >
          1
        </button>,
      );

      if (currentPage > 3) {
        pages.push(
          <span key="dots1" className="text-wood-brown px-2">
            ...
          </span>,
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageClick(i)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${
              currentPage === i
                ? "bg-primary text-white"
                : "border border-charcoal/10 dark:border-white/10 text-charcoal dark:text-white hover:bg-primary hover:text-white"
            }`}
          >
            {i}
          </button>,
        );
      }

      if (currentPage < totalPages - 2) {
        pages.push(
          <span key="dots2" className="text-wood-brown px-2">
            ...
          </span>,
        );
      }

      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageClick(totalPages)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${
            currentPage === totalPages
              ? "bg-primary text-white"
              : "border border-charcoal/10 dark:border-white/10 text-charcoal dark:text-white hover:bg-primary hover:text-white"
          }`}
        >
          {totalPages}
        </button>,
      );
    }

    return pages;
  };

  return (
    <>
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentProducts.map((product) => (
            <ProductCard key={product.product_id} item={product} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-10">
            <button
              title="previous-page"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border border-charcoal/10 dark:border-white/10 transition-colors ${
                currentPage === 1
                  ? "text-charcoal/30 dark:text-white/30 cursor-not-allowed"
                  : "text-charcoal dark:text-white hover:bg-primary hover:text-white cursor-pointer"
              }`}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            {renderPageNumbers()}

            <button
              title="next-page"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border border-charcoal/10 dark:border-white/10 transition-colors ${
                currentPage === totalPages
                  ? "text-charcoal/30 dark:text-white/30 cursor-not-allowed"
                  : "text-charcoal dark:text-white hover:bg-primary hover:text-white cursor-pointer"
              }`}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}

        {showScrollTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Cuộn lên đầu trang"
            className="fixed bottom-5 right-4 z-40 sm:hidden h-11 w-11 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowUp size={18} />
          </button>
        )}
      </>
    </>
  );
};

ProductList.propTypes = {};

export default ProductList;
