import { z } from "zod";

export const lowStockItemSchema = z
  .object({
    _id: z.string().optional(),
    id: z.string().optional(),
    product_franchise_id: z.string().optional(),
    product_name: z.string().optional(),
    category_name: z.string().optional(),
    quantity: z.number().optional(),
    reserved_quantity: z.number().optional(),
    alert_threshold: z.number().optional(),
    is_deleted: z.boolean().optional(),
    product_franchise: z.unknown().optional(),
  })
  .passthrough();

export type LowStockApiItem = z.infer<typeof lowStockItemSchema>;
