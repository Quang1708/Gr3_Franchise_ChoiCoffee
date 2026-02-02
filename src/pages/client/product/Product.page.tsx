import { useState } from "react";
import ProductMenu from "../../../components/Client/Product/Client.MenuHeader"
import ProductList from "../../../components/Client/Product/ProductList";


const ClientProductPage = ( ) => {
  const [activeCategory, setActiveCategory] = useState<string>("coffee-beans");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const CategoryRender = (cate:string) => {
    switch(cate) {
      case "coffee-beans":
        return <div>Hạt cà phê</div>;
      case "machines":
        return <div>Máy móc</div>;
      case "supplies":
        return <div>Vật tư</div>;
      case "tools":
        return <div>Dụng cụ pha chế</div>;
  }
}

  return (
    <>
      <nav className="bg-white dark:bg-background-dark border-b border-charcoal/5 dark:border-white/5 py-6">
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
                {CategoryRender(activeCategory)}
              </h1>
              <p className="text-wood-brown text-sm font-normal">
                Sản phẩm cà phê đặc sản tuyển chọn cho đối tác nhượng quyền
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
    </>
  );
}

export default ClientProductPage