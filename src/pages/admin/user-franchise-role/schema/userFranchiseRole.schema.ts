import { z } from "zod";

export const userFranchiseRoleSearchConditionSchema = z.object({
  user_id: z.string().optional(),
  role_id: z.string().optional(),
  franchise_id: z.string().optional(),
  is_deleted: z.union([z.boolean(), z.string()]).optional(),
});

export const userFranchiseRoleSearchSchema = z.object({
  searchCondition: userFranchiseRoleSearchConditionSchema,
  pageInfo: z.object({
    pageNum: z.number().min(1),
    pageSize: z.number().min(1),
  }),
});

export const getUserFranchiseRoleFormSchema = (mode: "create" | "edit" | "view") => {
  const userField = mode === "create"
    ? z.string().min(1, "Vui lòng chọn người dùng")
    : z.string().optional().or(z.literal(""));

  const roleField = mode === "view"
    ? z.string().optional().or(z.literal(""))
    : z.string().min(1, "Vui lòng chọn vai trò");

  return z.object({
    user_id: userField,
    role_id: roleField,
    franchise_id: z.string().nullable().optional(),
    note: z.string().optional().or(z.literal("")),
  });
};

export type UserFranchiseRoleSearchInput = z.infer<typeof userFranchiseRoleSearchSchema>;
