/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, MapPin, Layers, Info } from "lucide-react";

import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import FormSelect from "@/components/Admin/form/FormSelect";
import { FormInput } from "@/components/Admin/form/FormInput";
import type { ProductFranchise } from "@/components/cart/models/productResponse.model";

import { getAllFranchises } from "@/components/categoryFranchise/services/franchise08.service";
import { getSelectProductsService } from "@/pages/admin/product/services";
import { ProductFranchiseSchema, type ProductFranchiseFormValues } from "@/pages/admin/product/schema/ProductFranchiseSchema";
import { zodResolver } from "@hookform/resolvers/zod";

interface ProductFranchiseFormProps {
    isOpen: boolean;
    mode: "view" | "edit" | "create";
    initialData?: ProductFranchise | null;
    onClose: () => void;
    onSave: (data: any, setError: any) => void;
    isLoading?: boolean;
    existingDataList?: ProductFranchise[];
    isAdmin: boolean;
    selectedFranchiseId?: string;
}

export const ProductFranchiseForm = ({
    isOpen,
    mode,
    initialData,
    onClose,
    onSave,
    isLoading,
    existingDataList = [],
    isAdmin,
    selectedFranchiseId
}: ProductFranchiseFormProps) => {
    const [isReady, setIsReady] = useState(false);
    const [franchiseOptions, setFranchiseOptions] = useState<{ label: string; value: string }[]>([]);
    const [productOptions, setProductOptions] = useState<{ label: string; value: string }[]>([]);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setError,
        formState: { errors },
    } = useForm<ProductFranchiseFormValues>({
        resolver: zodResolver(ProductFranchiseSchema) as any,
        mode: "onChange",
    });

    const isView = mode === "view";
    const watchedFranchiseId = watch("franchise_id");
    const watchedProductId = watch("product_id");

    useEffect(() => {
        if (!isOpen) {
            reset({
                franchise_id: isAdmin ? "" : String(selectedFranchiseId || ""),
                product_id: "",
                size: "",
                price_base: 0,
            });
            setIsReady(false);
            return;
        }

        const initForm = async () => {
            try {
                const [franchiseRes, productRes] = await Promise.all([
                    getAllFranchises(),
                    getSelectProductsService()
                ]);

                if (franchiseRes) {
                    setFranchiseOptions(franchiseRes.map((f: any) => ({ label: f.name, value: f.value })));
                }
                if (productRes) {
                    setProductOptions(productRes.map((p: any) => ({ label: p.name, value: p.id })));
                }

                if (mode === "create") {
                    reset({
                        franchise_id: isAdmin ? "" : String(selectedFranchiseId || ""),
                        product_id: "",
                        size: "",
                        price_base: 0,
                    });
                } else if (initialData) {
                    reset(initialData);
                }
            } catch (err) {
                console.error("Lỗi khởi tạo form:", err);
            } finally {
                setIsReady(true);
            }
        };

        initForm();
    }, [isOpen, mode, initialData, isAdmin, selectedFranchiseId, reset]);

    const getSortedSizes = (items: any[]) => {
        const sizeArray = Array.from(new Set(items.map(m => String(m.size || "").trim())));

        const sizeOrder: Record<string, number> = {
            "S": 1, "M": 2, "L": 3, "XL": 4, "XXL": 5, "2XL": 5, "3XL": 6, "1 LÍT": 7
        };

        // 3. Thực hiện sort
        return sizeArray.sort((a, b) => {
            const valA = a.toUpperCase();
            const valB = b.toUpperCase();
            if (sizeOrder[valA] && sizeOrder[valB]) {
                return sizeOrder[valA] - sizeOrder[valB];
            }
            return valA.localeCompare(valB, undefined, { numeric: true });
        });
    };


    return (
        <CRUDModalTemplate
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'view' ? "Sản phẩm chi nhánh" : mode === 'edit' ? "Cập nhật sản phẩm" : "Thêm mới sản phẩm chi nhánh"}
            onSave={() => document.getElementById("product-franchise-submit-btn")?.click()}
            isLoading={isLoading}
            maxWidth="max-w-4xl"
            mode={mode}
        >

            <form
                onSubmit={handleSubmit((data) => onSave(data, setError))}
                className="relative min-h-112.5 w-full"
            >
                {!isReady && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-[2px] rounded-xl">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="mt-4 text-sm font-medium text-gray-500">Đang chuẩn bị dữ liệu...</p>
                    </div>
                )}

                <div className="space-y-6">
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border transition-all duration-300 ${(errors.franchise_id || errors.product_id) ? 'border-primary/30 bg-primary/2' : 'border-gray-200 bg-white shadow-sm'}`}>
                        <div className="col-span-2 flex items-center gap-2 text-blue-700 font-bold border-b pb-3 border-gray-100">
                            <MapPin size={20} /> <span>Thông tin phân phối</span>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-600">Chi nhánh áp dụng:</label>

                            {(isView || !isAdmin) ? (
                                <div className="py-2.5 text-gray-700 font-medium flex items-center justify-between">
                                    <span>
                                        {franchiseOptions.find(opt =>
                                            opt.value === String(watch("franchise_id") || initialData?.franchise_id || selectedFranchiseId)
                                        )?.label || "Đang tải tên chi nhánh..."}
                                    </span>
                                    {!isView && (
                                        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase">
                                            Cố định
                                        </span>
                                    )}

                                    <input type="hidden" {...register("franchise_id")} />
                                </div>
                            ) : (
                                <FormSelect
                                    options={franchiseOptions}
                                    register={register("franchise_id")}
                                    value={watch("franchise_id")}
                                    placeholder="Chọn chi nhánh"
                                    error={errors.franchise_id}
                                />
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-600">Sản phẩm:</label>
                            {isView ? (
                                <div className="py-2.5 text-gray-700 font-medium">
                                    {productOptions.find(opt => opt.value === watch("product_id"))?.label || "---"}
                                </div>
                            ) : (
                                <FormSelect
                                    options={productOptions.map(opt => {
                                        const fId = String(watchedFranchiseId || selectedFranchiseId || "");
                                        const matches = existingDataList.filter(item =>
                                            String(item.product_id) === String(opt.value) &&
                                            String(item.franchise_id) === fId
                                        );
                                        const sortedSizes = getSortedSizes(matches);
                                        const displaySizes = sortedSizes.join(", ");
                                        return {
                                            value: opt.value,
                                            label: matches.length > 0 ? `${opt.label} (Đã có: ${displaySizes})` : opt.label,
                                            isExisting: matches.length > 0
                                        };
                                    })}
                                    register={register("product_id")}
                                    value={watchedProductId}
                                    placeholder="Chọn sản phẩm"
                                    error={errors.product_id}
                                />
                            )}
                        </div>
                    </div>

                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border transition-all duration-300 ${(errors.price_base || errors.size) ? 'border-primary/30 bg-primary/2' : 'border-gray-200 bg-white shadow-sm'}`}>
                        <div className="col-span-2 flex items-center gap-2 text-primary font-bold border-b pb-3 border-gray-100">
                            <Layers size={20} /> <span>Size & Giá bán</span>
                        </div>

                        <div className="space-y-1.5">
                            <FormInput
                                label="Kích cỡ (Size):"
                                isView={isView}
                                register={register("size")}
                                error={errors.size}
                                placeholder="VD: L"
                                defaultValue={initialData?.size}
                            />
                            {isView ?
                                (
                                    <></>
                                ) : (
                                    <div className="mt-2 min-h-7.75 flex flex-wrap gap-2">
                                        {watchedProductId && (
                                            (() => {
                                                const matches = existingDataList.filter(item =>
                                                    String(item.product_id) === String(watchedProductId) &&
                                                    String(item.franchise_id) === String(watchedFranchiseId || selectedFranchiseId)
                                                );
                                                if (matches.length === 0) return null;
                                                const sortedSizes = getSortedSizes(matches);
                                                return (
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-[14px] text-gray-500">Đã có size:</div>
                                                        {sortedSizes.map((size, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="text-[14px] bg-orange-100 text-orange-700 px-2 py-1 rounded-md border border-orange-200 font-medium"
                                                            >
                                                                {size}
                                                            </span>
                                                        ))}
                                                    </div>
                                                );
                                            })()
                                        )}
                                    </div>
                                )
                            }
                        </div>

                        <div className="space-y-1.5">
                            <FormInput
                                label="Giá cơ bản:"
                                type="number"
                                isView={isView}
                                register={register("price_base")}
                                error={errors.price_base}
                                placeholder="VD: 10000"
                                defaultValue={initialData?.price_base}
                            />
                        </div>

                        <div className="col-span-2 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3 items-start">
                            <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                            <p className="text-[13px] text-blue-700 leading-relaxed">
                                Lưu ý: Hệ thống cho phép tự nhập <strong>Kích cỡ</strong>. Vui lòng thống nhất cách đặt tên (ví dụ cùng là "L" thay vì "Large") để dễ dàng quản lý kho.
                            </p>
                        </div>
                    </div>
                </div>

                <button id="product-franchise-submit-btn" type="submit" className="hidden" />
            </form>
        </CRUDModalTemplate>
    );
};