
interface MenuItem {
  id: number;
  label: string;
  category?: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
}

interface ClientMenuRenderProps {
  item: MenuItem;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

const ClientMenuRender = ({item, activeCategory, setActiveCategory}: ClientMenuRenderProps) => {
    const isActive = item.category === activeCategory;
    
    const handleClick = () => {
        if (item.category) {
            setActiveCategory(item.category);
        }
    };
    
  return (
    <a 
        onClick={handleClick}
        className={`w-30 h-30 transition-all duration-300 ease-in-out group relative flex flex-col items-center justify-center gap-3 px-6 py-4 rounded-xl cursor-pointer
            ${isActive 
                ? 'bg-primary/10 dark:bg-primary/20 border-2 border-primary shadow-md' 
                : 'bg-white dark:bg-white/5 border border-charcoal/5 dark:border-white/10 hover:shadow-lg'}
        `}>
        <div className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors duration-300
            ${isActive 
                ? 'bg-primary text-white' 
                : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'}
        `}>
            <span className="material-symbols-outlined text-2xl fill-icon">{item.icon}</span>
        </div>
        <span className={`font-bold text-sm tracking-tight
            ${isActive 
                ? 'text-primary dark:text-primary' 
                : 'text-charcoal dark:text-white'}
        `}>{item.label}</span>
        <div className={`absolute -bottom-6.25 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full transition-opacity duration-300
            ${isActive ? 'opacity-100' : 'opacity-0'}
        `}></div>
    </a>
  )
}

ClientMenuRender.propTypes = {}

export default ClientMenuRender