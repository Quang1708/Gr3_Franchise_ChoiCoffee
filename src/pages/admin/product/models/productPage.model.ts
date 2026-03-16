import type { Product } from "@/models/product.model";

export type ProductRow = Product & { is_deleted: boolean };

export type ProductFilters = Partial<Record<keyof Product, string>>;

export type ProductModalType = "delete" | "restore";

export interface ProductModalConfig {
  isOpen: boolean;
  type: ProductModalType;
  product: Product | null;
}

export const toProductRow = (item: Product): ProductRow => ({
  ...item,
  is_deleted: item.is_deleted,
});
