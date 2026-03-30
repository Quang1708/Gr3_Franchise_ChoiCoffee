import type { CategoryFranchise } from "./models/category.model";


interface ClientMenuRenderProps {
  item: CategoryFranchise;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

const ClientMenuRender = ({item, activeCategory, setActiveCategory}: ClientMenuRenderProps) => {
    const isActive = item.category_id === activeCategory;
    
    const handleClick = () => {
        if (item.category_id) {
            setActiveCategory(item.category_id);
        }
    };
    // const backgroundCateRender = (cateId:number) => {
    //     switch(cateId) {
    //         case 1:
    //             return 'https://a.cdn-hotels.com/gdcs/production137/d1409/c1412301-3700-484c-b249-cc25b67e2bb6.jpg'
    //         default:
    //             return ''
    //     }
    // }
    return (
        <button
            type="button"
            onClick={handleClick}
            className={`
                shrink-0 lg:shrink
                w-auto lg:w-60
                rounded-full lg:rounded-lg
                border border-charcoal/10 dark:border-white/10 lg:border-l-2
                px-4 py-2.5 lg:px-6 lg:py-4
                text-left whitespace-nowrap lg:whitespace-normal
                transition-all duration-300 ease-in-out
                ${
                    isActive
                        ? "bg-primary/20 border-primary/40 lg:border-primary"
                        : "bg-white dark:bg-transparent hover:bg-primary/5"
                }
            `}
        >
            <span
                className={`font-bold text-sm tracking-tight ${
                    isActive
                        ? "text-primary dark:text-primary"
                        : "text-charcoal dark:text-white"
                }`}
            >
                {item.category_name}
            </span>
        </button>
    );
}

export default ClientMenuRender