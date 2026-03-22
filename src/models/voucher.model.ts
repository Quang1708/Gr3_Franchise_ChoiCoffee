/**
 * Model chuẩn theo bảng voucher (DB).
 * API có thể trả snake_case (franchise_id, start_time...) → map trong service.
 */
export type VoucherType = "PERCENT" | "FIXED";

export interface Voucher {
  id: string | number;
  code: string;
  franchiseId: string | number;
  franchiseName?: string;
  productFranchiseId: string | number | null;
  productName?: string;
  name: string;
  description: string;
  type: VoucherType;
  value: number;
  quotaTotal: number;
  quotaUsed: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  isDeleted: boolean;
  createdBy?: string | number;
  createdAt: string;
  updatedAt: string;
}
