import { useEffect, useState } from "react";
import ProductMenu from "../../../components/Client/Product/Client.MenuHeader";
// import ProductList from "../../../components/Client/Product/ProductList";
import type { Category } from "@/models/category.model";
import { CATEGORY_SEED_DATA } from "@/mocks/category.seed";
import ProductList from "@/components/Client/Product/ProductList";

const ClientProductPage = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const categories: Category[] = CATEGORY_SEED_DATA;
  const [activeCategory, setActiveCategory] = useState<number>(
    categories[0].id,
  );
  const [category, setCategory] = useState<Category>();
<<<<<<< HEAD
=======
  const [isNavSticky, setIsNavSticky] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const navOffsetTop = useRef<number>(0);

  useEffect(() => {
    if (navRef.current) {
      navOffsetTop.current = navRef.current.offsetTop;
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsNavSticky(window.scrollY >= navOffsetTop.current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
>>>>>>> 44d6630ad0e709ef1ee1e243cc5ec8d9a2825fac

  const handleCategoryChange = (category: number) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const CategoryRender = () => {
    const cate = categories.find((cat) => cat.id === activeCategory);
    setCategory(cate);
  };
  useEffect(() => {
    CategoryRender();
  }, [activeCategory]);
  return (
    <>
      <div className="relative ">
        <img
          src="https://images.squarespace-cdn.com/content/v1/5ebe4d17fa0cb47f52dd2601/bf63362a-b99b-466f-9d21-a648925b9ba3/latte+art.jpeg"
          alt="Banner"
          className="w-full h-100 object-cover"
        />

<<<<<<< HEAD
      <div className="flex flex-col lg:flex-row gap-12 pb-20 min-h-screen">
        <nav 
        className="w-full lg:w-72 shrink-0 transition-all duration-300 nav-wrapper sticky top-21 self-start">
          <ProductMenu
            activeCategory={activeCategory}
            setActiveCategory={handleCategoryChange}
          />
        </nav>
        <div className="flex flex-1 justify-center">
          <div className="layout-content-container flex flex-col max-w-7xl flex-1 px-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
              <div className="flex flex-col gap-1">
                <h1 className="text-charcoal dark:text-white text-3xl font-black tracking-tight">
                  {category?.name}
                </h1>
                <p className="text-wood-brown text-sm font-normal">
                  {category?.description}
                </p>
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
=======
        <div className="py-6 px-12 flex items-center">
          <h1 className="w-full h-15 text-left text-4xl text-charcoal font-bold my-6 border-b border-primary">
            Thực đơn
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 pb-20 min-h-screen sticky top-0">
          <nav
            ref={navRef}
            className={`w-full lg:w-72 shrink-0 transition-all duration-300 nav-wrapper ${
              isNavSticky ? "lg:sticky lg:top-4 lg:self-start" : ""
            }`}
          >
            <ProductMenu
              activeCategory={activeCategory}
              setActiveCategory={handleCategoryChange}
>>>>>>> 44d6630ad0e709ef1ee1e243cc5ec8d9a2825fac
            />
          </nav>
          <div className="flex flex-1 justify-center">
            <div className="layout-content-container flex flex-col max-w-7xl flex-1 px-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
                <div className="flex flex-col gap-1">
                  <h1 className="text-charcoal dark:text-white text-3xl font-black tracking-tight">
                    {category?.name}
                  </h1>
                  <p className="text-wood-brown text-sm font-normal">
                    {category?.description}
                  </p>
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
      </div>
    </>
  );
};

export default ClientProductPage;
