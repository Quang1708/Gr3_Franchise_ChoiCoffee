import { z } from "zod";

const BenefitSchema = z.object({
    order_discount_percent: z.coerce.number().min(0).max(100),
    earn_multiplier: z.coerce.number().min(0),
    free_shipping: z.boolean().default(false),
});

const TierRuleSchema = z.object({
    tier: z.string().min(1, "Tên hạng không được để trống"),
    min_points: z.coerce.number().min(0),
    max_points: z.coerce.number().optional(),
    benefit: BenefitSchema,
});

export const LoyaltyRuleSchema = z.object({
    franchise_id: z.string().min(1, "Vui lòng chọn chi nhánh"),
    earn_amount_per_point: z.coerce.number().min(100),
    redeem_value_per_point: z.coerce.number().min(100),
    min_redeem_points: z.coerce.number().min(0),
    max_redeem_points: z.coerce.number().min(0),
    description: z.string().min(1, "Mô tả không được để trống"),
    tier_rules: z.array(TierRuleSchema).min(1, "Phải có ít nhất một hạng thành viên"),
});

export type LoyaltyRuleFormData = z.infer<typeof LoyaltyRuleSchema>;