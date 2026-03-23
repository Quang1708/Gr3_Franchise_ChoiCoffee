import type { InventoryAlertItem } from "../models/dashboard.model";
import { lowStockService } from "../services/lowStock.service";

export const getLowStockAlertsUsecase = async (
  franchiseId: string,
): Promise<InventoryAlertItem[]> => lowStockService.getAlerts(franchiseId);
