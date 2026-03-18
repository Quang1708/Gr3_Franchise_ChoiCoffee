import { useEffect, useMemo, useRef, useState } from "react";
import { getCategoryFranchise } from "../services/category.service";
import type { CategoryFranchise } from "../models/category.model";
import {
  isToppingCategory,
  setToppingCategoryId,
  removeToppingCategoryId,
} from "../utils/category.util";

export const useCategory = (
  activeCategory: string,
  setActiveCategory: (id: string, name: string) => void,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [franchiseId, setFranchiseId] = useState(() => {
    return localStorage.getItem("selectedFranchise") ?? "";
  });

  const [categories, setCategories] = useState<CategoryFranchise[]>([]);
  const activeCategoryRef = useRef(activeCategory);

  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

  useEffect(() => {
    if (!franchiseId) {
      setCategories([]);
      removeToppingCategoryId();
      return;
    }

    let cancelled = false;

    const fetchCategoryFranchise = async () => {
      setIsLoading(true);
      try {
        const res = await getCategoryFranchise(franchiseId);

        if (cancelled) return;

        if (res) {
          setCategories(res);

          const topping = res.find(isToppingCategory);

          if (topping) {
            setToppingCategoryId(topping.category_id);
          } else {
            removeToppingCategoryId();
          }

          if (res.length > 0) {
            const current = activeCategoryRef.current;
            const valid = res.some((c) => c.category_id === current);

            if (!current || !valid) {
              setActiveCategory(res[0].category_id, res[0].category_name);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchCategoryFranchise();

    return () => {
      cancelled = true;
    };
  }, [franchiseId]);

  useEffect(() => {
    const handler = (e: Event) => {
      const id = String((e as CustomEvent).detail.franchiseId);

      localStorage.setItem("selectedFranchise", id);

      setFranchiseId((prev) => {
        if (prev === id) return prev;
        return id;
      });
    };

    window.addEventListener("franchiseChanged", handler);
    return () => window.removeEventListener("franchiseChanged", handler);
  }, []);

  const mappedCategories = useMemo(() => {
    return categories.filter((c) => c.franchise_id === franchiseId);
  }, [categories, franchiseId]);

  const categoryInfo = useMemo(() => {
    return mappedCategories.find((c) => c.category_id === activeCategory);
  }, [mappedCategories, activeCategory]);

  return {
    isLoading,
    mappedCategories,
    categoryInfo,
  };
};
