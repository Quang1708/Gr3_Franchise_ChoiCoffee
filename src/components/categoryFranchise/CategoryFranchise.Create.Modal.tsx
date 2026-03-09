import { useEffect, useState } from "react";
import { getAllCategory } from "./services/category07.service";
import type { Category } from "./models/category.model";

type categoryFranchiseCreateModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void; // Replace 'any' with the actual data type
}

const CategoryFranchiseCreateModal = (categoryFranchiseCreateModalProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await getAllCategory();
                
                if(response) {
                    setCategories(response);
                }
                console.log(categories);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategory();
    }, [])

  return (
    <div >
        
    </div>
  )
}


export default CategoryFranchiseCreateModal