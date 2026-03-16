export interface Product {
  id: string;
  SKU: string;
  name: string;
  description: string;
  content: string;
  image_url: string;
  images_url: string[];
  min_price: number;
  max_price: number;
  is_active: boolean;
  is_deleted: boolean;
  is_have_topping: boolean;
  created_at: string;
  updated_at: string;
}
