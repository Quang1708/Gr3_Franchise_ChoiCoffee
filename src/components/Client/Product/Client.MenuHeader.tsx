import ClientMenuRender from "./ClientMenuRender";

interface ProductMenuProps {
    activeCategory: string;
    setActiveCategory: (category: string) => void;
}

const ProductMenu = ({activeCategory, setActiveCategory}: ProductMenuProps) => {
    
    const categories = [
        {
            id: 1,
            label: "Hạt cà phê",
            category: "coffee-beans",
            icon: "coffee"
        },
        {
            id: 2,
            label: "Máy móc",
            category: "machines",
            icon: "precision_manufacturing"
        },
        {
            id: 3,
            label: "Vật tư",
            category: "supplies",
            icon: "package_2"
        },
        {
            id: 4,
            label: "Dụng cụ",
            category: "tools",
            icon: "local_cafe"
        }
        
    ];
  return (
    
        <div className="max-w-7xl mx-auto px-10">
            <div className="flex items-center justify-center gap-6 md:gap-10">
                {categories.map((category) => (
                    <ClientMenuRender 
                        key={category.id} 
                        item={category} 
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                    />
                ))}
            </div>
        </div>
  )
}

export default ProductMenu