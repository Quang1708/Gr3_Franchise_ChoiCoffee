export type VoucherFormData = {
  franchise_id: string;
  name: string;
  type: string;
  value: number;
  product_franchise_id?: string;
  quota_total: number;
  start_date: string;
  end_date: string;
};