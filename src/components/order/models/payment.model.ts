export type Payment = {
  _id: string;
  franchise_id: string;
  customer_id: string;
  order_id: string;
  code: string;
  method: string; 
  status: string; 
  amount: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string; 
  updated_at: string;
  __v: number;
};