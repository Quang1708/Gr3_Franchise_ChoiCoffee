export type CartVoucher = {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  endTime: string;
  isActive: boolean;
};
