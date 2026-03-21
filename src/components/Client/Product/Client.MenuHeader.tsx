import ClientMenuRender from "./ClientMenuRender";
import ClientLoading from "../Client.Loading";

import type { CategoryFranchise } from "./models/category.model";

interface ProductMenuProps {
    isLoading: boolean;
    categories: CategoryFranchise[];
    activeCategory: string;
    setActiveCategory: (
    categoryId: string) => void;
}

const ProductMenu = ({ activeCategory, setActiveCategory, categories, isLoading }: ProductMenuProps) => {
    
    // Lọc categories theo franchise
    const handleCategorySelect = (cat: CategoryFranchise) => {
    setActiveCategory(cat.category_id);
  };

    if (isLoading) {
        return <ClientLoading />;
    }
  return (
    <>
        {/* {isLoading && <ClientLoading />} */}
        <div className="space-y-3 px-4 lg:px-15 pb-10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-neutral-500 mb-5 ml-4">Danh mục</h3>          
            <div className="flex flex-col gap-4">
                {categories.map((category) => (
                    <ClientMenuRender 
                        key={category.category_id} 
                        item={category} 
                        activeCategory={activeCategory}
                        setActiveCategory={() => handleCategorySelect(category)}
                    />
                ))}
            </div>
        </div>
    </>
  )
}

export default ProductMenu;