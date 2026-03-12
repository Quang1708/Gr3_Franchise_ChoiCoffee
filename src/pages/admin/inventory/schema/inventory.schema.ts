import * as z from "zod"

export const createInventorySchema = z.object({
  productFranchiseId: z.string().min(1, "Sản phẩm là bắt buộc"),

  quantity: z
    .number({ message: "Số lượng phải là số" })
    .min(0, "Số lượng phải >= 0"),

  alertThreshold: z
    .number({ message: "Ngưỡng cảnh báo phải là số" })
    .min(0, "Ngưỡng cảnh báo phải >= 0"),
})

export const adjustInventorySchema = z.object({
  inventoryId: z.string(),

  quantity: z
    .number({ message: "Số lượng phải là số" }),
})

export type CreateInventoryForm = z.infer<typeof createInventorySchema>
export type AdjustInventoryForm = z.infer<typeof adjustInventorySchema>