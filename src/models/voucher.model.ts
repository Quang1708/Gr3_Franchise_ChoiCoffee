/**
 * Model chuẩn theo bảng voucher (DB).
 * API có thể trả snake_case (franchise_id, start_time...) → map trong service.
 */
export type VoucherType = "PERCENT" | "FIXED";

export interface Voucher {
  id: number;
  code: string;
  franchiseId: number;
  productFranchiseId: number | null;
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
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}
