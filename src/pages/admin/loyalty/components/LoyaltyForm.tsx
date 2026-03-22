import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2, Coins, Award, Loader2 } from "lucide-react";

import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import FormSelect from "@/components/Admin/form/FormSelect";
import { FormInput } from "@/components/Admin/form/FormInput";
import type { LoyaltyRule } from "@/pages/admin/loyalty/models/loyalty.model";
import { getAllFranchises } from "@/components/categoryFranchise/services/franchise08.service";

interface LoyaltyFormProps {
    isOpen: boolean;
    mode: "view" | "edit" | "create";
    initialData?: LoyaltyRule | null;
    onClose: () => void;
    onSave: (data: any) => void;
    isLoading?: boolean;
    selectedFranchiseId?: string;
    isAdmin?: boolean;
    existingFranchiseIds?: string[];
}

export const LoyaltyForm = ({
    isOpen,
    mode,
    initialData,
    onClose,
    onSave,
    isLoading,
    selectedFranchiseId,
    isAdmin,
    existingFranchiseIds = [],
}: LoyaltyFormProps) => {

    const {
        register,
        handleSubmit,
        watch,
        reset,
        control,
        getValues,
        formState: { errors },
    } = useForm<any>({
        defaultValues: initialData || {},
        values: initialData || {
            franchise_id: selectedFranchiseId || "",
            tier_rules: [],
            earn_amount_per_point: "",
            redeem_value_per_point: "",
        },
        mode: "onChange",
    });

    const isView = mode === "view";
    const [isReady, setIsReady] = useState(false);

    const { fields, append, remove } = useFieldArray({ control, name: "tier_rules" });

    const [franchiseOptions, setFranchiseOptions] = useState<{
        label: string;
        value: string;
        className?: string;
        isExisting?: boolean;
    }[]>([]);

    // Load franchise options
    useEffect(() => {
        if (!isOpen) {
            setIsReady(false);
            return;
        }
        const initForm = async () => {
            try {
                if (isAdmin) {
                    const res = await getAllFranchises();
                    if (res) {
                        setFranchiseOptions(
                            res.map((f: any) => ({
                                label: f.name,
                                value: f.value,
                                isExisting: existingFranchiseIds.includes(f.value),
                            }))
                        );
                    }
                } else if (selectedFranchiseId) {
                    setFranchiseOptions([{ label: "Chi nhánh hiện tại", value: selectedFranchiseId }]);
                }
                if (mode === "create") {
                    reset({
                        franchise_id: selectedFranchiseId || "",
                        tier_rules: [],
                        earn_amount_per_point: "",
                        redeem_value_per_point: "",
                        min_redeem_points: "",
                        max_redeem_points: "",
                        description: ""
                    });
                }
            } catch (err) {
                console.error("Lỗi khởi tạo form:", err);
            } finally {
                setIsReady(true);
            }
        };
        initForm();
    }, [isOpen, mode, isAdmin, selectedFranchiseId, existingFranchiseIds, reset]);


    return (
        <CRUDModalTemplate
            isOpen={isOpen}
            onClose={onClose}
            title={mode === "create" ? "Thêm Loyalty" : "Chi tiết Loyalty"}
            onSave={handleSubmit(onSave)}
            isLoading={isLoading}
            maxWidth="max-w-5xl"
            mode={mode}
        >
            <div className="relative min-h-125">
                {/* Overlay Loading: Chỉ hiện khi đang chuẩn bị data */}
                {!isReady && (
                    <div className="absolute inset-0 z-60 flex flex-col items-center justify-center bg-white/90 backdrop-blur-[2px] rounded-xl transition-all duration-300">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="mt-4 text-sm font-medium text-gray-500">Đang nạp dữ liệu...</p>
                    </div>
                )}
                <div className="space-y-6">
                    {/* Franchise select */}
                    {isAdmin && (
                        <div className="space-y-1.5">
                            <label className={`text-sm font-medium text-gray-500`}>
                                Chi nhánh áp dụng
                            </label>

                            {isView ? (
                                <div className="py-2">
                                    <span className="text-base font-semibold text-gray-700">
                                        {franchiseOptions.find(opt => opt.value === getValues("franchise_id"))?.label || "Không xác định"}
                                    </span>
                                </div>
                            ) : (
                                <FormSelect
                                    options={franchiseOptions}
                                    register={register("franchise_id")}
                                    placeholder="Chọn chi nhánh"
                                    value={watch("franchise_id")}
                                />
                            )}
                            <p className="text-primary text-xs mt-1">Vui lòng chọn chi nhánh để tạo hạng thành viên. </p>
                        </div>
                    )}

                    {/* General config */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl border border-gray-200">
                        <div className="col-span-2 flex items-center gap-2 text-blue-700 font-bold mb-1">
                            <Coins size={20} /> <span>Thông số tích & đổi điểm</span>
                        </div>

                        <FormInput
                            label="Tiền chi tiêu / 1 điểm"
                            type="number"
                            placeholder="Ví dụ: Chi tiêu 10,000 VND → nhận 1 điểm"
                            isView={isView}
                            register={register("earn_amount_per_point", {
                                required: "Vui lòng nhập số tiền cần chi tiêu để được 1 điểm."
                            })}
                            error={errors.earn_amount_per_point}
                            className="w-full"
                            defaultValue={initialData?.earn_amount_per_point}
                        />

                        <FormInput
                            label="Giá trị / 1 điểm"
                            type="number"
                            placeholder="Ví dụ: 1 điểm → giảm 1,000 VND"
                            isView={isView}
                            register={register("redeem_value_per_point", {
                                required: "Vui lòng nhập giá trị của 1 điểm khi đổi."
                            })}
                            error={errors.redeem_value_per_point}
                            className="w-full"
                            defaultValue={initialData?.redeem_value_per_point}
                        />

                        <FormInput
                            label="Điểm đổi tối thiểu"
                            type="number"
                            placeholder="Nhập số điểm tối thiểu để khách đổi thưởng (VD: 10)"
                            isView={isView}
                            register={register("min_redeem_points", {
                                required: "Vui lòng nhập số điểm tối thiểu khách phải có để thực hiện đổi thưởng."
                            })}
                            error={errors.min_redeem_points}
                            className="w-full"
                            defaultValue={initialData?.min_redeem_points}
                        />

                        <FormInput
                            label="Điểm đổi tối đa"
                            type="number"
                            placeholder="Nhập số điểm tối đa khách có thể đổi 1 lần (VD: 500)"
                            isView={isView}
                            register={register("max_redeem_points", {
                                required: "Vui lòng nhập số điểm tối đa khách có thể dùng trong một lần đổi."
                            })}
                            error={errors.max_redeem_points}
                            className="w-full"
                            defaultValue={initialData?.max_redeem_points}
                        />

                        <div className="col-span-2 space-y-1.5">
                            {isView ? (
                                <FormInput
                                    label="Mô tả quy tắc"
                                    isView={isView}
                                    register={register("description")}
                                    error={errors.description}
                                    placeholder="Chưa có mô tả"
                                    className="w-full"
                                />
                            ) : (
                                <>
                                    <label className="text-sm font-medium text-gray-500">Mô tả quy tắc</label>
                                    <textarea
                                        {...register("description")}
                                        rows={4}
                                        placeholder="Nhập mô tả chi tiết quy tắc..."
                                        className={`w-full px-3 py-2 rounded-xl border ${errors.description ? "border-red-500" : "border-gray-200"
                                            } focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none text-[14px] transition-all hover:border-gray-300`}
                                    />
                                    {errors.description && (
                                        <span className="text-xs text-red-500">{(errors.description as any).message}</span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tier rules */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-gray-800 font-bold">
                                <Award size={20} className="text-orange-500" />
                                <span>Cấu hình hạng thành viên ({fields.length})</span>
                            </div>

                            {!isView && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        append({
                                            tier: "",
                                            min_points: 0,
                                            max_points: 0,
                                            benefit: {
                                                order_discount_percent: 0,
                                                earn_multiplier: 1,
                                                free_shipping: false,
                                            },
                                        })
                                    }
                                    className="text-sm bg-primary text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-primary/90 transition-all shadow-sm"
                                >
                                    <Plus size={16} /> Thêm hạng
                                </button>
                            )}
                        </div>

                        {fields.length === 0 && (
                            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                                Chưa có hạng thành viên nào.
                            </div>
                        )}

                        {fields.map((field, index) => {
                            const item = field as any;
                            return (
                                <div
                                    key={field.id}
                                    className={`pt-7 pb-2 px-5 border rounded-2xl relative shadow-sm transition-colors 
                                ${isAdmin && franchiseOptions.find(f => f.value === getValues("franchise_id"))?.isExisting
                                            ? "bg-white border border-gray-200 hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all duration-300"
                                            : "bg-white border-gray-200"
                                        }`}
                                >
                                    {!isView && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}

                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                                        {/* Tên hạng */}
                                        <FormInput
                                            label="Tên hạng"
                                            type="text"
                                            placeholder="VD: BRONZE, SILVER, GOLD, PLATINUM"
                                            isView={isView}
                                            register={register(`tier_rules.${index}.tier`)}
                                            defaultValue={item.tier}
                                        />

                                        {/* Điểm từ */}
                                        <FormInput
                                            label="Điểm từ"
                                            type="number"
                                            placeholder="Điểm tối thiểu để thuộc hạng này (VD: 0)"
                                            isView={isView}
                                            register={register(`tier_rules.${index}.min_points`)}
                                            defaultValue={item.min_points}
                                        />

                                        {/* Đến điểm */}
                                        <FormInput
                                            label="Đến điểm"
                                            type="number"
                                            placeholder="Điểm tối đa để thuộc hạng này (VD: 299)"
                                            isView={isView}
                                            register={register(`tier_rules.${index}.max_points`)}
                                            defaultValue={item.max_points}
                                        />

                                        {/* % Giảm đơn */}
                                        <FormInput
                                            label="% Giảm đơn"
                                            type="number"
                                            placeholder="Giảm giá khi đặt hàng (VD: 5 → giảm 5%)"
                                            isView={isView}
                                            register={register(`tier_rules.${index}.benefit.order_discount_percent`)}
                                            defaultValue={item.benefit?.order_discount_percent}
                                        />

                                        {/* Hệ số tích điểm */}
                                        <FormInput
                                            label="Hệ số tích"
                                            type="number"
                                            step="0.01"
                                            placeholder="Hệ số nhân điểm khi chi tiêu (VD: 1.25)"
                                            isView={isView}
                                            register={register(`tier_rules.${index}.benefit.earn_multiplier`)}
                                            defaultValue={item.benefit?.earn_multiplier}
                                        />
                                    </div>

                                    <div className="mt-4 flex items-center gap-2 p-2 rounded-lg">
                                        <input
                                            type="checkbox"
                                            id={`fs-${index}`}
                                            readOnly={isView}
                                            {...register(`tier_rules.${index}.benefit.free_shipping`)}
                                            className={`w-4 h-4 rounded border-gray-300 transition-all cursor-pointer
                                        ${isView
                                                    ? "pointer-events-none opacity-100 text-green-600 accent-green-600 border-green-500"
                                                    : "text-orange-500 focus:ring-orange-500"
                                                }`}
                                        />
                                        <label htmlFor={`fs-${index}`} className="text-sm text-gray-600 font-semibold cursor-pointer select-none">
                                            Miễn phí vận chuyển (Free Shipping)
                                        </label>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </CRUDModalTemplate >
    );
};