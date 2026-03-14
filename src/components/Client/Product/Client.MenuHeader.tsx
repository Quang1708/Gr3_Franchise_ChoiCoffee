import ClientMenuRender from "./ClientMenuRender";
import { useEffect, useState } from "react";
import ClientLoading from "../Client.Loading";
import { getCategoryFranchise } from "./services/category.service";
import type { CategoryFranchise } from "./models/category.model";
import { isToppingCategory, setToppingCategoryId, removeToppingCategoryId } from "./utils/category.util";

interface ProductMenuProps {
    activeCategory: string;
    setActiveCategory: (
    categoryId: string,
    name?: string,
    description?: string) => void;
}

const ProductMenu = ({activeCategory, setActiveCategory}: ProductMenuProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [franchiseId, setFranchiseId] = useState<string>(() => {
        return localStorage.getItem("selectedFranchise") ?? "";
    });
    const [categoryFranchise, setCategoryFranchise] = useState<CategoryFranchise[]>([]);
    
    // Lọc categories theo franchise
    const mappedCategories = categoryFranchise.filter(
        category => category.franchise_id === franchiseId
    );

    const handleCategorySelect = (category: CategoryFranchise) => {
        setActiveCategory(
            category.category_id,
            category.category_name,
            category.category_name
        );
    };

    useEffect(() => {
        const fetchCategory = async () => {
            setIsLoading(true);
            try{
                const response = await getCategoryFranchise(franchiseId);
                
                if(response) {
                    setCategoryFranchise(response);
                    
                    const toppingCat = response.find(isToppingCategory);
                    
                    if (toppingCat) {
                        setToppingCategoryId(toppingCat.category_id);
                        console.log('✅ Topping category found and saved:', toppingCat);
                    } else {
                        removeToppingCategoryId();
                        console.log('⚠️ No topping category found');
                    }
                    
                    setIsLoading(false);
                    if (!activeCategory && response.length > 0) {
                        setActiveCategory(response[0].category_id, response[0].category_name);
                    }
                }
            }catch(error) {
                console.error("Error fetching category franchise:", error);
                setIsLoading(false);
            }finally {
                setIsLoading(false);
            }
        }
        fetchCategory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [franchiseId]);

    useEffect(() => {
        const handleFranchiseChange = (event: Event) => {
            const customEvent = event as CustomEvent<{ franchiseId: number }>;
            const newFranchiseId = customEvent.detail.franchiseId.toString();
            
            setIsLoading(true);
            localStorage.setItem("selectedFranchise", newFranchiseId);
            setFranchiseId(newFranchiseId);
        };

        window.addEventListener("franchiseChanged", handleFranchiseChange);
        return () => {
            window.removeEventListener("franchiseChanged", handleFranchiseChange);
        };
    }, []);

    useEffect(() => {
         if(
            mappedCategories.length > 0 &&
            !mappedCategories.some(cat => cat.category_id === activeCategory) &&
            !activeCategory
        ){
            setActiveCategory(mappedCategories[0].category_id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [franchiseId]);

    useEffect(() => {
        if (mappedCategories.length > 0 && !activeCategory) {
            setActiveCategory(mappedCategories[0].category_id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mappedCategories.length]);

    if (isLoading) {
        return <ClientLoading />;
    }
  return (
    <>
        {/* {isLoading && <ClientLoading />} */}
        <div className="sticky top-32 space-y-3 px-15">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-neutral-500 mb-5 ml-4">Danh mục</h3>          
            <div className="flex flex-col gap-4">
                {mappedCategories.map((category) => (
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