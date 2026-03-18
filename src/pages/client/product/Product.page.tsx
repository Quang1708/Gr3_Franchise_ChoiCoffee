import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductMenu from "../../../components/Client/Product/Client.MenuHeader";
// import ProductList from "../../../components/Client/Product/ProductList";
import ProductList from "@/components/Client/Product/ProductList";
import { useCategory } from "../../../components/Client/Product/hooks/useCategory";


const ClientProductPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const activeCategory = searchParams.get('category') || "";


  const handleCategoryChange = (id: string) => {
  setSearchParams({ category: id });
  setCurrentPage(1);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

  const {
    isLoading,
    mappedCategories,
    categoryInfo
  } = useCategory(activeCategory, handleCategoryChange);

  
  return (
    <>
      {/* <img
        src="https://images.squarespace-cdn.com/content/v1/5ebe4d17fa0cb47f52dd2601/bf63362a-b99b-466f-9d21-a648925b9ba3/latte+art.jpeg"
        alt="Banner"
        className="w-full h-100 object-cover"
      /> */}
      <div className="py-6 px-12 flex items-center ">
        <h1 className="w-full h-15 text-left text-4xl text-charcoal font-bold my-6 border-b border-primary">
          Thực đơn
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 pb-20 min-h-screen">
        <nav className="w-full lg:w-72 shrink-0 transition-all duration-300 nav-wrapper sticky top-21 self-start">
          <ProductMenu
            activeCategory={activeCategory}
            setActiveCategory={handleCategoryChange}
            categories={mappedCategories}
            isLoading={isLoading}
          />
        </nav>
        <div className="flex flex-1 justify-center">
          <div className="layout-content-container flex flex-col max-w-7xl flex-1 px-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
              <div className="flex flex-col gap-1">
                <h1 className="text-charcoal dark:text-white text-3xl font-black tracking-tight">
                  {categoryInfo?.category_name || "Đang tải"}
                </h1>
                {/* <p className="text-wood-brown text-sm font-normal">
                  {categoryInfo.description}
                </p> */}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white dark:bg-background-dark border border-charcoal/5 dark:border-white/5 rounded-lg px-3 py-2">
                  <span className="text-wood-brown text-xs font-bold uppercase">
                    Sắp xếp:
                  </span>
                  <select
                    title="Sort by"
                    className="cursor-pointer bg-transparent border-none text-charcoal dark:text-white text-sm font-bold focus:ring-0 p-0 pr-6"
                  >
                    <option>Mới nhất</option>
                    <option>Giá: Thấp đến Cao</option>
                    <option>Giá: Cao đến Thấp</option>
                    <option>Phổ biến nhất</option>
                  </select>
                </div>
                <button className="cursor-pointer flex items-center gap-2 bg-white dark:bg-background-dark border border-charcoal/5 dark:border-white/5 rounded-lg px-4 py-2 text-charcoal dark:text-white text-sm font-bold hover:bg-charcoal/5 transition-colors">
                  <span className="material-symbols-outlined text-lg">
                    filter_list
                  </span>
                  Lọc
                </button>
              </div>
            </div>
            <main className="flex flex-col gap-8">
              <ProductList
                category={activeCategory}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientProductPage;
