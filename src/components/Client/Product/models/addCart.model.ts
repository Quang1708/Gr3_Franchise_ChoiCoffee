export type AddCartRequest = {
    franchise_id: string;
    product_franchise_id: string;
    quantity: number;
    address: string;
    phone: string;
    note: string;
    message: string;
    options: {
        product_franchise_id: string;
        quantity: number;
  }[];
}