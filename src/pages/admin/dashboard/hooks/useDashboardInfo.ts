import { useEffect, useState } from "react";
import type { DashboardInfo, InventoryAlertItem } from "../models/dashboard.model";
import { getDashboardInfoUsecase, getLowStockAlertsUsecase } from "../usecases";
import { toastError } from "@/utils/toast.util";

export const useDashboardInfo = (
  dashboardFranchiseId: string | null,
  lowStockFranchiseId: string | null,
) => {
  const [dashboardInfo, setDashboardInfo] = useState<DashboardInfo | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [lowStockItems, setLowStockItems] = useState<InventoryAlertItem[]>([]);
  const [isLowStockLoading, setIsLowStockLoading] = useState(false);

  useEffect(() => {
    const loadDashboardInfo = async () => {
      try {
        setIsDashboardLoading(true);
        const data = await getDashboardInfoUsecase(dashboardFranchiseId);
        setDashboardInfo(data);
      } catch {
        setDashboardInfo(null);
        toastError("Cannot load dashboard data");
      } finally {
        setIsDashboardLoading(false);
      }
    };

    void loadDashboardInfo();
  }, [dashboardFranchiseId]);

  useEffect(() => {
    const loadLowStock = async () => {
      if (!lowStockFranchiseId) {
        setLowStockItems([]);
        return;
      }

      try {
        setIsLowStockLoading(true);
        const mapped = await getLowStockAlertsUsecase(String(lowStockFranchiseId));
        setLowStockItems(mapped);
      } catch {
        setLowStockItems([]);
        toastError("Cannot load low stock data");
      } finally {
        setIsLowStockLoading(false);
      }
    };

    void loadLowStock();
  }, [lowStockFranchiseId]);

  return {
    dashboardInfo,
    isDashboardLoading,
    lowStockItems,
    isLowStockLoading,
  };
};
