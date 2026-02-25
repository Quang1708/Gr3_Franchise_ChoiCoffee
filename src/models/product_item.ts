export interface ProductItem {
    product_franchise_id: number;
    product_name: string;
    image_url: string;
    price_base: number;
    quantity: number;
    category_name?: string;
    SKU?: string;
}