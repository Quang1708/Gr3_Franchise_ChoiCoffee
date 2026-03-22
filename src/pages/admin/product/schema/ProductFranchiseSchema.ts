import { z } from "zod";

export const ProductFranchiseSchema = z.object({
    franchise_id: z.string().min(1, "Vui lòng chọn chi nhánh!"),
    product_id: z.string().min(1, "Vui lòng chọn sản phẩm!"),
    size: z.string().min(1, "Vui lòng nhập kích cỡ").max(10, "Tên size quá dài"),
    price_base: z.coerce.number().min(1, "Giá phải lớn hơn 0")
});

export type ProductFranchiseFormValues = z.infer<typeof ProductFranchiseSchema>;