export interface ProductFranchise {
  id: string;
  product_id: string;
  product_name: string;
  franchise_id: string;
  franchise_name: string;
  size: string;
  price_base: number;
  is_active: boolean;
}

export interface PageInfo {
  pageNum: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}