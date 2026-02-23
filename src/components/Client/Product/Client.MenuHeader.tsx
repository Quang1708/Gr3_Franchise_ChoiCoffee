import type { Category } from "@/models/category.model";
import ClientMenuRender from "./ClientMenuRender";
import { CATEGORY_SEED_DATA } from "@/mocks/category.seed";
import type { CategoryFranchise } from "@/models/category_franchise.model";
import { CATEGORY_FRANCHISE_SEED_DATA } from "@/mocks/category_franchise.seed";
import { useEffect, useState } from "react";
import ClientLoading from "../Client.Loading";

interface ProductMenuProps {
    activeCategory: number;
    setActiveCategory: (category: number) => void;
}

const ProductMenu = ({activeCategory, setActiveCategory}: ProductMenuProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [franchise, setFranchise] = useState<string>(() => {
        return localStorage.getItem("selectedFranchise") || "1";
    });
    const categoriesFranchise:CategoryFranchise[] =  CATEGORY_FRANCHISE_SEED_DATA;
    const filteredCategories = categoriesFranchise.filter(category => 
        category.franchiseId === Number(franchise)
    );
    const category:Category[] = CATEGORY_SEED_DATA;
    const mappedCategories = filteredCategories.map(catFranchise => {
        return category.find(cat => cat.id === catFranchise.categoryId);
    }).filter((cat): cat is Category => cat !== undefined);   
     
    const handleCategorySelect = (categoryId: number) => {
        setIsLoading(true);
        setTimeout(() => {
            setActiveCategory(categoryId);
            setIsLoading(false);
        }, 400);
    };

    useEffect(() => {
        const handleFranchiseChange = (event: Event) => {
            const customEvent = event as CustomEvent<{ franchiseId: number }>;
            const newFranchiseId = customEvent.detail.franchiseId.toString();
            
            setIsLoading(true);
            setTimeout(() => {
                setFranchise(newFranchiseId);
                setIsLoading(false);
            }, 500);
        };

        window.addEventListener("franchiseChanged", handleFranchiseChange);

        return () => {
            window.removeEventListener("franchiseChanged", handleFranchiseChange);
        };
    }, []);

    useEffect(() => {
        if(!mappedCategories.find(cat => cat.id === activeCategory)) {
            if(mappedCategories.length > 0) {
                setActiveCategory(mappedCategories[0].id);
            }
        }
    }, [franchise, mappedCategories, activeCategory, setActiveCategory]);
    
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
                        key={category.id} 
                        item={category} 
                        activeCategory={activeCategory}
                        setActiveCategory={handleCategorySelect}
                    />
                ))}
            </div>
        </div>
    </>
  )
}

export default ProductMenu