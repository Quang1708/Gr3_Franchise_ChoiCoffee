import { z } from "zod";

export const customerSearchSchema = z.object({
    keyword: z.string().optional(),
    isActive: z.union([z.boolean(), z.string()]).optional(),
    pageNum: z.number(),
    pageSize: z.number(),
});

export type CustomerSearchInput = z.infer<typeof customerSearchSchema>;