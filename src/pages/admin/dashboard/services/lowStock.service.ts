import { inventoryService } from "../../inventory/services/inventory.service";
import { searchProductFranchiseService } from "../../product/services/productFranchise/productFranchise02.service";
import type { InventoryAlertItem } from "../models/dashboard.model";
import { lowStockItemSchema } from "../schemas/lowStock.schema";

export const lowStockService = {
  async getAlerts(franchiseId: string): Promise<InventoryAlertItem[]> {
    const res = await inventoryService.getLowStock(franchiseId);
    const items = (res?.data?.data as unknown[]) ?? [];

    const parsed = lowStockItemSchema.array().safeParse(items);
    const safeItems = parsed.success ? parsed.data : [];

    if (!safeItems.length) return [];

    const productMap = new Map<string, { name: string; size?: string }>();
    const pfRes = await searchProductFranchiseService({
      searchCondition: {
        product_id: "",
        franchise_id: String(franchiseId),
        size: "",
        price_from: "",
        price_to: "",
        is_active: "",
        is_deleted: false,
      },
      pageInfo: {
        pageNum: 1,
        pageSize: 1000,
      },
    });

    const pfItems = pfRes?.data ?? [];
    pfItems.forEach((pf) => {
      const raw = pf as unknown as Record<string, unknown>;
      const id = String((raw.id ?? raw._id ?? "") as string);
      if (!id) return;
      productMap.set(id, {
        name: String(raw.product_name ?? ""),
        size: String(raw.size ?? ""),
      });
    });

    return safeItems
      .filter((item) => item.is_active !== false)
      .map((item) => {
        const quantity = Number(item.quantity ?? 0);
        const alertThreshold = Number(item.alert_threshold ?? 0);
        const ratio = alertThreshold > 0 ? quantity / alertThreshold : 1;
        const status = ratio <= 0.4 ? "critical" : ratio <= 0.7 ? "low" : "warning";

        const productFranchiseId = String(item.product_franchise_id ?? "");
        const productInfo = productMap.get(productFranchiseId);
        const category = String(item.category_name ?? "");
        const productFranchise = item.product_franchise as
          | { product_name?: string }
          | undefined;
        const productName = String(
          productInfo?.name ||
            productFranchise?.product_name ||
            item.product_name ||
            productFranchiseId ||
            "Unknown product",
        );

        return {
          id: String(item.id ?? item._id ?? productFranchiseId ?? ""),
          productName,
          currentStock: quantity,
          minStock: alertThreshold,
          status,
          category,
        } as InventoryAlertItem;
      });
  },
};
