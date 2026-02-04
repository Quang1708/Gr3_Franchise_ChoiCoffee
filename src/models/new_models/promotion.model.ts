export type PromotionType = "PERCENT" | "FIXED";

export interface Promotion {
  id: number;
  franchiseId: number;
  productFranchiseId?: number; // nullable: NULL = applied to whole store (or logic defined elsewhere)
  type: PromotionType;
  value: number;
  startTime: string;
  endTime: string;
  createdBy: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
