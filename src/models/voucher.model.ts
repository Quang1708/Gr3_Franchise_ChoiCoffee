/**
 * Model chuẩn cho voucher giữa các module.
 * service/voucher.service.ts sẽ map dữ liệu API vào dạng này.
 */

export type VoucherType = "PERCENT" | "FIXED";

export type Voucher = {
  id: string;
  code: string;
  franchiseId: string;
  franchiseName?: string;
  productFranchiseId?: string | null;
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
};

