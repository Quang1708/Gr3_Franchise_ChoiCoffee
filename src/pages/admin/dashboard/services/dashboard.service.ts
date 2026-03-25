import { axiosAdminClient } from "@/api";
import type { DashboardInfo } from "../models/dashboard.model";

export const dashboardService = {
  async getDashboardInfo(
    franchiseId?: string | null,
  ): Promise<DashboardInfo | null> {
    const normalized = typeof franchiseId === "string" ? franchiseId.trim() : "";
    const isValidId =
      Boolean(normalized) && normalized !== "null" && normalized !== "undefined";
    const params = isValidId
      ? { franchise_id: normalized, franchiseId: normalized }
      : undefined;
    const res = await axiosAdminClient.get("/api/dashboards", { params });
    return res.data?.data ?? null;
  },
};
