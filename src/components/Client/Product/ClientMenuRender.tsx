import type { Category } from "@/models/category.model";

interface ClientMenuRenderProps {
  item: Category;
  activeCategory: number;
  setActiveCategory: (category: number) => void;
}

const ClientMenuRender = ({item, activeCategory, setActiveCategory}: ClientMenuRenderProps) => {
    const isActive = item.id === activeCategory;
    
    const handleClick = () => {
        if (item.id) {
            setActiveCategory(item.id);
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
    <a 
        onClick={handleClick}
        className={`w-60 border-l-2 border-primary bg-primary/10 transition-all duration-300 ease-in-out group relative flex flex-col items-start justify-center gap-3 px-6 py-4 rounded-lg cursor-pointer
            ${isActive 
                ? ' bg-primary/30' 
                : ' border-charcoal/5 dark:border-white/10'}
        `}>
        <span className={`font-bold text-sm tracking-tight
            ${isActive 
                ? 'text-primary dark:text-primary' 
                : 'text-charcoal dark:text-white'}
        `}>{item.name}</span>
        {/* <div className={`absolute -bottom-6.25 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full transition-opacity duration-300
            ${isActive ? 'opacity-100' : 'opacity-0'}
        `}></div> */}
    </a>
  )
}

export default ClientMenuRender