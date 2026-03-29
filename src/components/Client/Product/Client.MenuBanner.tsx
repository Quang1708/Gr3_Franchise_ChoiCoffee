import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { getMenuProducts } from "./services/client03.service";
import type { Category, MenuData } from "./models/client03.model";

import { toast } from "react-toastify";

// Constants
const AUTO_ROTATE_INTERVAL = 5000;
const IMAGE_TRANSITION_DURATION = 1000;
const FALLBACK_IMAGE = "https://via.placeholder.com/600x400?text=No+Image";

interface MenuBannerProps {
  autoRotate?: boolean;
  rotateInterval?: number;
  className?: string;
}

const MenuBanner = ({ 
  autoRotate = true, 
  rotateInterval = AUTO_ROTATE_INTERVAL,
  className = "" 
}: MenuBannerProps) => {
  // State
  const [menuData, setMenuData] = useState<MenuData>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Get franchise ID from localStorage
  const franchiseId = useMemo(
    () => localStorage.getItem("selectedFranchise") || "",
    []
  );

  // Fetch menu data
  useEffect(() => {
    if (!franchiseId) {
      setError("Vui lòng chọn chi nhánh");
      setIsLoading(false);
      return;
    }

    const fetchMenuData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await getMenuProducts(franchiseId);
        
        if (response && response.length > 0) {
          setMenuData(response);
        } else {
          setError("Không có dữ liệu danh mục");
        }
      } catch (err) {
        console.error("Error fetching menu data:", err);
        setError("Không thể tải danh mục sản phẩm");
        toast.error("Không thể tải danh mục sản phẩm");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, [franchiseId]);

  // Auto-rotate carousel
  useEffect(() => {
    if (!autoRotate || menuData.length === 0 || isHovered) return;

    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % menuData.length);
    }, rotateInterval);

    return () => clearInterval(timer);
  }, [menuData.length, isHovered, autoRotate, rotateInterval]);

  // Handle category click
  const handleCategoryClick = useCallback((categoryId: string) => {
    navigate(`/menu?category=${categoryId}`);
  }, [navigate]);

  // Handle category hover
  const handleCategoryHover = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] md:min-h-[500px] bg-background-light rounded-4xl ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-charcoal font-medium">Đang tải danh mục...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error || menuData.length === 0) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] md:min-h-[500px] bg-background-light rounded-4xl ${className}`}>
        <div className="text-center space-y-3">
          <div className="text-5xl">☕</div>
          <p className="text-charcoal font-medium text-lg">
            {error || "Không có danh mục nào"}
          </p>
          <p className="text-clay text-sm">
            Vui lòng thử lại sau hoặc chọn chi nhánh khác
          </p>
        </div>
      </div>
    );
  }

  return (
    <section 
      className={`flex flex-col md:flex-row bg-background-light rounded-4xl overflow-hidden shadow-sm border border-input-border ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Danh mục sản phẩm"
    >
      {/* Left Panel - Category Navigation */}
      <CategoryNavigation
        menuData={menuData}
        activeIndex={activeIndex}
        onCategoryClick={handleCategoryClick}
        onCategoryHover={handleCategoryHover}
      />

      {/* Right Panel - Image Carousel */}
      <ImageCarousel
        menuData={menuData}
        activeIndex={activeIndex}
      />
    </section>
  );
};

// Category Navigation Component
interface CategoryNavigationProps {
  menuData: MenuData;
  activeIndex: number;
  onCategoryClick: (categoryId: string) => void;
  onCategoryHover: (index: number) => void;
}

const CategoryNavigation = ({
  menuData,
  activeIndex,
  onCategoryClick,
  onCategoryHover
}: CategoryNavigationProps) => {
  return (
    <div className="w-full md:w-[45%] p-10 md:p-16 flex flex-col justify-center">
      <h2 className="text-3xl md:text-4xl font-black text-center text-charcoal dark:text-white mb-12 tracking-tight">
        Danh mục sản phẩm
      </h2>
      
      <nav 
        className="flex flex-col space-y-3"
        role="navigation"
        aria-label="Danh mục sản phẩm"
      >
        {menuData.map((item, index) => (
          <CategoryButton
            key={item.category_id}
            item={item}
            isActive={index === activeIndex}
            onClick={() => onCategoryClick(item.category_id)}
            onHover={() => onCategoryHover(index)}
          />
        ))}
      </nav>
    </div>
  );
};

// Category Button Component
interface CategoryButtonProps {
  item: Category;
  isActive: boolean;
  onClick: () => void;
  onHover: () => void;
}

const CategoryButton = ({ 
  item, 
  isActive, 
  onClick, 
  onHover 
}: CategoryButtonProps) => {
  return (
    <button
      onMouseEnter={onHover}
      onClick={onClick}
      className={`
        flex items-center justify-between w-full text-left 
        px-6 py-4 rounded-2xl 
        transition-all duration-500 ease-out 
        group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${isActive 
          ? 'bg-espresso text-white shadow-md scale-[1.02]' 
          : 'bg-transparent text-charcoal hover:bg-[#f5f1ea] hover:scale-[1.01]'
        }
      `}
      aria-label={`Xem ${item?.category_name}`}
      aria-current={isActive ? 'true' : undefined}
    >
      <span 
        className={`
          text-lg md:text-xl tracking-wide transition-all
          ${isActive ? 'font-semibold' : 'font-light'}
        `}
      >
        {item.category_name}
      </span>
      
      {isActive && (
        <div 
          className="bg-background-light text-espresso p-1.5 rounded-full flex items-center justify-center animate-in fade-in slide-in-from-left-2 duration-300"
          aria-hidden="true"
        >
          <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
        </div>
      )}
    </button>
  );
};

// Image Carousel Component
interface ImageCarouselProps {
  menuData: MenuData;
  activeIndex: number;
}

const ImageCarousel = ({ menuData, activeIndex }: ImageCarouselProps) => {
  return (
    <div className="w-full md:w-[55%] relative min-h-75 md:min-h-125 overflow-hidden bg-clay/10">
      {menuData.map((item, index) => {
        const imageUrl = item.products[0]?.image_url || FALLBACK_IMAGE;
        const isActive = index === activeIndex;
        
        return (
          <img
            key={item.category_id}
            src={imageUrl}
            alt={`${item.category_name} - Sản phẩm đại diện`}
            loading={index === 0 ? "eager" : "lazy"}
            className={`
              absolute inset-0 w-full h-full object-cover 
              transition-all ease-in-out transform origin-center
              ${isActive 
                ? 'opacity-100 scale-100 z-10' 
                : 'opacity-0 scale-105 z-0 pointer-events-none'
              }
            `}
            style={{
              transitionDuration: `${IMAGE_TRANSITION_DURATION}ms`
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = FALLBACK_IMAGE;
            }}
          />
        );
      })}
      
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-linear-to-t from-charcoal/20 to-transparent z-20 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
};

export default MenuBanner;
