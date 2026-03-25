export type CartVoucher = {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  startTime: string;
  endTime: string;
  quotaTotal: number;
  quotaUsed: number;
  isActive: boolean;
};
