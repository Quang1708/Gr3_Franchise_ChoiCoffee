import { useEffect, useState } from "react";
import { getMenuProducts } from "./services/client03.service";
import type { MenuData } from "./models/client03.model";
import { useNavigate } from "react-router-dom";


const MenuBanner = () => {

  const franchiseSelected = localStorage.getItem("selectedFranchise");
  const [menuData, setMenuData] = useState<MenuData>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

    useEffect(() => {
        const fetchMenuData = async () => {
            try{
                const response = await getMenuProducts(franchiseSelected || "");
                if (response) {
                    console.log(response);
                    setMenuData(response);
                }
            }catch(error){
                console.error("Error fetching menu data:", error);  
            }             
        }
        fetchMenuData();
    }, [franchiseSelected]);



  return (
    <div className="flex flex-col md:flex-row bg-[#FDFBF7] rounded-4xl overflow-hidden shadow-sm border border-[#f0ebe1]">
        
        <div className="w-full md:w-[45%] p-10 md:p-16 flex flex-col justify-center">
          
          <h2 className="text-3xl  md:text-4xl font-black text-center text-charcoal dark:text-white mb-12 tracking-tight">
            Danh mục sản phẩm
          </h2>
          <nav className="flex flex-col space-y-3">
            {menuData.map((item, index) => {
              const isActive = index === activeIndex;            
              return (
                <button
                  key={item.category_id}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    console.log('Navigating to category:', item.category_id);
                    navigate(`/menu?category=${item.category_id}`);
                  }}
                  className={`flex items-center justify-between w-full text-left px-6 py-4 rounded-2xl transition-all duration-500 ease-out group
                    ${isActive 
                      ? 'bg-[#0B1B32] text-white shadow-md' 
                      : 'bg-transparent text-[#2c3e50] hover:bg-[#f5f1ea]'
                    }`}
                >
                  <span className={`text-lg md:text-xl tracking-wide ${isActive ? 'font-medium' : 'font-light'}`}>
                    {item.category_name}
                  </span>
                  {isActive && (
                    <div className="bg-[#FDFBF7] text-[#0B1B32] p-1.5 rounded-full flex items-center justify-center">
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        strokeWidth="2.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="w-full md:w-[55%] relative min-h-100 md:min-h-150 overflow-hidden">
          {menuData.map((item, index) => (
            <img
              key={item.category_id}
              src={item.products[0]?.image_url || "https://via.placeholder.com/600x400?text=No+Image"}
              alt={item.category_name}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out transform origin-center
                ${index === activeIndex 
                  ? 'opacity-100 scale-100 z-10' 
                  : 'opacity-0 scale-105 z-0 pointer-events-none'
                }`}
            />
          ))}
        </div>

      </div>
    
  )
}
export default MenuBanner;