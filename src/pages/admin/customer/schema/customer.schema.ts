import { z } from "zod";

export const customerSearchSchema = z.object({
    keyword: z.string().optional(),
    isActive: z.union([z.boolean(), z.string()]).optional(),
    pageNum: z.number(),
    pageSize: z.number(),
})

export const customerSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Password tối thiểu 6 ký tự"),
    phone: z.string().min(10, "SĐT không hợp lệ"),
    name: z.string().optional(),
    address: z.string().optional(),
    avatar_url: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type CustomerSearchInput = z.infer<typeof customerSearchSchema>;