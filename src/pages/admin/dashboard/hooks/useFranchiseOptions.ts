import { useEffect, useState } from "react";
import { franchiseService } from "@/pages/admin/franchise/services/franchise.service";

export type FranchiseOption = {
  id: string;
  name: string;
  code: string;
};

export const useFranchiseOptions = (enabled: boolean) => {
  const [options, setOptions] = useState<FranchiseOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let isActive = true;

    const loadFranchises = async () => {
      try {
        setIsLoading(true);
        const data = await franchiseService.search();
        if (!isActive) return;
        const mapped = Array.isArray(data)
          ? data
              .filter((f) => !f.is_deleted && f.isActive)
              .map((f) => ({ id: f.id, name: f.name, code: f.code }))
          : [];
        setOptions(mapped);
      } catch {
        if (!isActive) return;
        setOptions([]);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadFranchises();

    return () => {
      isActive = false;
    };
  }, [enabled]);

  return { options, isLoading };
};
