export interface CartOption {
  quantity: number;
  product_franchise_id: string;
  price_snapshot: number;
  discount_amount: number;
  final_price: number;
  product_name: string;
  product_image_url: string;
}

export interface CartItem {
  cart_item_id: string;
  quantity: number;
  product_franchise_id: string;
  product_cart_price: number;
  discount_amount: number;
  line_total: number;
  final_line_total: number;
  options_hash: string;
  note?: string;
  product_name: string;
  product_image_url: string;
  options: CartOption[];
}

export interface Cart {
  _id: string;
  customer_id: string;
  franchise_id: string;
  status:  string;
  address?: string;
  phone?: string;
  promotion_discount?: number;
  voucher_discount?: number;
  loyalty_points_used?: number;
  loyalty_discount?: number;
  subtotal_amount: number;
  final_amount: number;
  franchise_name: string;
  customer_name: string;
  cart_items: CartItem[];
}

