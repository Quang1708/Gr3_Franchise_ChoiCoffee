export type Options = {
  product_franchise_id: string;
  quantity: number;
};

export type CartFormValues = {
    customer_id: string;
    franchise_id: string;
    product_franchise_id: string;
    quantity: number;
    address: string;
    phone: string;
    note: string;
    message: string;
    options: Options[];
};