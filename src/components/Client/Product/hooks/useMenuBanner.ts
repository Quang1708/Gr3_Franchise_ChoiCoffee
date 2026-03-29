import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { getMenuProducts } from "../services/client03.service";
import type { MenuData } from "../models/client03.model";

interface UseMenuBannerOptions {
  autoRotate?: boolean;
  rotateInterval?: number;
}

interface UseMenuBannerReturn {
  menuData: MenuData;
  activeIndex: number;
  isHovered: boolean;
  isLoading: boolean;
  error: string | null;
  setActiveIndex: (index: number) => void;
  setIsHovered: (hovered: boolean) => void;
  handleCategoryClick: (categoryId: string, navigate: (path: string) => void) => void;
  handleCategoryHover: (index: number) => void;
}

/**
 * Custom hook for MenuBanner component logic
 * Handles data fetching, auto-rotation, and user interactions
 */
export const useMenuBanner = ({
  autoRotate = true,
  rotateInterval = 5000
}: UseMenuBannerOptions = {}): UseMenuBannerReturn => {
  const [menuData, setMenuData] = useState<MenuData>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const handleCategoryClick = useCallback(
    (categoryId: string, navigate: (path: string) => void) => {
      navigate(`/menu?category=${categoryId}`);
    },
    []
  );

  // Handle category hover
  const handleCategoryHover = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return {
    menuData,
    activeIndex,
    isHovered,
    isLoading,
    error,
    setActiveIndex,
    setIsHovered,
    handleCategoryClick,
    handleCategoryHover
  };
};
