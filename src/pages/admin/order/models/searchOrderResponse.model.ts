export type OrderItem = {
  order_item_id: string;
  quantity: number;
  product_franchise_id: string;
  price_snapshot: number;
  discount_amount: number;
  line_total: number;
  final_line_total: number;
  options_hash: string;
  product_name: string;
  product_image_url: string;
  options: any[];
};

export type Order = {
  _id: string;
  customer_id: string;
  franchise_id: string;
  staff_id: string;
  code: string;
  status: string;
  promotion_discount: number;
  voucher_discount: number;
  loyalty_discount: number;
  subtotal_amount: number;
  final_amount: number;
  promotion_type: string;
  promotion_value: number;
  voucher_type: string;
  voucher_value: number;
  loyalty_points_used: number;
  franchise_name: string;
  customer_name: string;
  staff_name: string;
  staff_email: string;
  order_items: OrderItem[];
};

export type OrderByFranchise = {
  _id: string;
  customer_id: string;
  code: string;
  status: string;
  phone: string;
  subtotal_amount: number;
  final_amount: number;
  customer_name: string;
  created_at: string;
}