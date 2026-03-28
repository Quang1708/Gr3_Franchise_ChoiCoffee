export type VoucherSearchCondition = {
  code: string;
  franchise_id: string;
  product_franchise_id: string;
  type: string;
  value: string;
  start_date: string;
  end_date: string;
  is_active: "" | boolean;
  is_deleted: "" | boolean;
};

export type PageInfo = {
  pageNum: number;
  pageSize: number;
};

export type SearchVoucherRequest = {
  searchCondition: VoucherSearchCondition;
  pageInfo: PageInfo;
};