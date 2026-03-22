export type Items = {
    product_franchise_id: string;
    quantity: number;
    note: string;
    options: { 
        product_franchise_id: string; 
        quantity: number }[];
}

export type CreateCartRequest = {
    customer_id: string;
    franchise_id: string;
    items: Items[]
}