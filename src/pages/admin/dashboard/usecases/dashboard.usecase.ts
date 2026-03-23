import type { DashboardInfo } from "../models/dashboard.model";
import { dashboardService } from "../services/dashboard.service";

export const getDashboardInfoUsecase = async (
  franchiseId?: string | null,
): Promise<DashboardInfo | null> => dashboardService.getDashboardInfo(franchiseId);
