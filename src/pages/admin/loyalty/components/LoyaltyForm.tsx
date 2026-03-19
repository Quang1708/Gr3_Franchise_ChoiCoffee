import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2, Award, Coins } from "lucide-react";
import type { LoyaltyRule } from "@/pages/admin/loyalty/models/loyalty.model";
import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import { FormInput } from "@/components/Admin/form/FormInput";

interface LoyaltyFormProps {
    isOpen: boolean;
    mode: "view" | "edit" | "create";
    initialData?: LoyaltyRule | null;
    onClose: () => void;
    onSave: (data: any) => void;
    isLoading?: boolean;
}

export const LoyaltyForm = ({
    isOpen,
    mode,
    initialData,
    onClose,
    onSave,
    isLoading
}: LoyaltyFormProps) => {
    const {
        register,
        control,
        handleSubmit,
        reset,
    } = useForm<LoyaltyRule>({
        values: initialData || undefined,
        resetOptions: {
            keepDefaultValues: false,
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "tier_rules",
    });

    const isView = mode === "view";

    useEffect(() => {
        if (!isOpen) return;
        if (mode === "create") {
            reset({
                earn_amount_per_point: 10000,
                redeem_value_per_point: 1000,
                min_redeem_points: 10,
                max_redeem_points: 500,
                description: "Quy tắc tích điểm mặc định",
                tier_rules: [
                    {
                        tier: "BRONZE",
                        min_points: 0,
                        max_points: 1000,
                        benefit: { order_discount_percent: 0, earn_multiplier: 1, free_shipping: false }
                    }
                ],
            });
        }

        if ((mode === "edit" || mode === "view") && initialData) {
            reset(initialData);
        }
    }, [isOpen, mode, reset]);

    return (
        <CRUDModalTemplate
            isOpen={isOpen}
            onClose={onClose}
            title={mode === "create" ? "Thêm quy tắc Loyalty" : "Chi tiết quy tắc Loyalty"}
            mode={mode}
            isLoading={isLoading}
            onSave={handleSubmit(onSave)}
            maxWidth="max-w-5xl"
        >
            <div className="space-y-6">
                {/* SECTION 1: CẤU HÌNH CHUNG */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                    <div className="col-span-2 flex items-center gap-2 text-blue-700 font-bold mb-1">
                        <Coins size={20} />
                        <span>Thông số tích & đổi điểm</span>
                    </div>

                    <FormInput
                        label="Tiền tích / 1 điểm (VNĐ)"
                        type="number"
                        isView={isView}
                        register={register("earn_amount_per_point", { valueAsNumber: true })}
                        defaultValue={initialData?.earn_amount_per_point}
                    />
                    <FormInput
                        label="Giá trị / 1 điểm (VNĐ)"
                        type="number"
                        isView={isView}
                        register={register("redeem_value_per_point", { valueAsNumber: true })}
                        defaultValue={initialData?.redeem_value_per_point}
                    />
                    <FormInput
                        label="Điểm đổi tối thiểu"
                        type="number"
                        isView={isView}
                        register={register("min_redeem_points", { valueAsNumber: true })}
                        defaultValue={initialData?.min_redeem_points}
                    />
                    <FormInput
                        label="Điểm đổi tối đa"
                        type="number"
                        isView={isView}
                        register={register("max_redeem_points", { valueAsNumber: true })}
                        defaultValue={initialData?.max_redeem_points}
                    />
                    <div className="col-span-2">
                        <FormInput
                            label="Mô tả quy tắc"
                            isView={isView}
                            register={register("description")}
                            defaultValue={initialData?.description}
                        />
                    </div>
                </div>

                {/* SECTION 2: DANH SÁCH HẠNG (TIERS) */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-800 font-bold">
                            <Award size={20} className="text-orange-500" />
                            <span>Cấu hình hạng thành viên ({fields.length})</span>
                        </div>

                        {!isView && (
                            <button
                                type="button"
                                onClick={() => append({
                                    tier: "BRONZE",
                                    min_points: 0,
                                    max_points: 0,
                                    benefit: { order_discount_percent: 0, earn_multiplier: 1, free_shipping: false }
                                })}
                                className="text-sm bg-orange-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-orange-600 transition-all shadow-sm"
                            >
                                <Plus size={16} /> Thêm hạng
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="p-5 bg-white border border-gray-200 rounded-2xl relative shadow-sm hover:border-orange-200 transition-colors"
                            >
                                {!isView && (
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hạng</label>
                                        <select
                                            disabled={isView}
                                            {...register(`tier_rules.${index}.tier` as const)}
                                            className="w-full h-[42px] border border-gray-300 rounded-xl px-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                                        >
                                            <option value="BRONZE">BRONZE</option>
                                            <option value="SILVER">SILVER</option>
                                            <option value="GOLD">GOLD</option>
                                            <option value="PLATINUM">PLATINUM</option>
                                        </select>
                                    </div>

                                    <FormInput
                                        label="Điểm từ"
                                        type="number"
                                        isView={isView}
                                        register={register(`tier_rules.${index}.min_points`, { valueAsNumber: true })}
                                        defaultValue={initialData?.tier_rules?.[index].min_points}
                                    />
                                    <FormInput
                                        label="Đến điểm"
                                        type="number"
                                        isView={isView}
                                        register={register(`tier_rules.${index}.max_points`, { valueAsNumber: true })}
                                        defaultValue={initialData?.tier_rules?.[index].max_points}
                                    />
                                    <FormInput
                                        label="% Giảm đơn"
                                        type="number"
                                        isView={isView}
                                        register={register(`tier_rules.${index}.benefit.order_discount_percent`, { valueAsNumber: true })}
                                        defaultValue={initialData?.tier_rules?.[index].benefit.order_discount_percent}
                                    />
                                    <FormInput
                                        label="Hệ số tích"
                                        type="number"
                                        step="0.01"
                                        isView={isView}
                                        register={register(`tier_rules.${index}.benefit.earn_multiplier`, { valueAsNumber: true })}
                                        defaultValue={initialData?.tier_rules?.[index].benefit.earn_multiplier}
                                    />
                                </div>

                                <div className="mt-4 flex items-center gap-2 bg-gray-50/50 p-2 rounded-lg inline-flex">
                                    <input
                                        type="checkbox"
                                        id={`fs-${index}`}
                                        disabled={isView}
                                        {...register(`tier_rules.${index}.benefit.free_shipping`)}
                                        className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                                    />
                                    <label
                                        htmlFor={`fs-${index}`}
                                        className="text-sm text-gray-600 font-semibold cursor-pointer select-none"
                                    >
                                        Miễn phí vận chuyển (Free Shipping)
                                    </label>
                                </div>
                            </div>
                        ))}

                        {fields.length === 0 && (
                            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                                Chưa có cấu hình hạng thành viên nào.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CRUDModalTemplate>
    );
};