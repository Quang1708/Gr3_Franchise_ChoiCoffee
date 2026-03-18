import { z } from "zod";

// Schema dùng cho form lọc / tìm kiếm
export const productCategoryFranchiseSearchConditionSchema = z.object({
  franchise_id: z.string().optional(),
  category_id: z.string().optional(),
  product_id: z.string().optional(),
  is_active: z.union([z.boolean(), z.string()]).optional(),
  is_deleted: z.union([z.boolean(), z.string()]).optional(),
});

export const productCategoryFranchiseSearchSchema = z.object({
  searchCondition: productCategoryFranchiseSearchConditionSchema,
  pageInfo: z.object({
    pageNum: z.number().min(1),
    pageSize: z.number().min(1),
  }),
});

// Schema dùng cho form tạo mapping mới
export const productCategoryFranchiseCreateSchema = z.object({
  category_franchise_id: z
    .string()
    .min(1, "Vui lòng chọn danh mục chi nhánh"),
  product_franchise_id: z
    .string()
    .min(1, "Vui lòng chọn sản phẩm chi nhánh"),
  display_order: z
    .number()
    .int("Thứ tự hiển thị phải là số nguyên")
    .min(1, "Thứ tự hiển thị tối thiểu là 1"),
});

export type ProductCategoryFranchiseSearchInput = z.infer<
  typeof productCategoryFranchiseSearchSchema
>;

export type ProductCategoryFranchiseCreateInput = z.infer<
  typeof productCategoryFranchiseCreateSchema
>;

