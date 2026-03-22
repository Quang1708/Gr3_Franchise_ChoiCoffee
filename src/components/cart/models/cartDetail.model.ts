export interface Product {
  name: string;
  image_url: string;
}

export interface OptionItem {
  quantity: number;
  product_franchise_id: string;
  price_snapshot: number;
  discount_amount: number;
  final_price: number;
  product: Product;
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
  note: string;
  product: Product;
  options: OptionItem[];
}

export interface CartData {
  _id: string;
  customer_id: string;
  franchise_id: string;
  status: string; // Có thể thêm các status khác nếu có
  address: string;
  phone: string;
  promotion_discount: number;
  voucher_discount: number;
  loyalty_points_used: number;
  loyalty_discount: number;
  subtotal_amount: number;
  final_amount: number;
  franchise_name: string;
  customer_name: string;
  voucher_code?: string; // Field này có thể xuất hiện khi áp dụng voucher thành công
  cart_items: CartItem[];
}