import { FormInput } from "@/components/Admin/Form/FormInput";
import { useForm } from "react-hook-form";
import { useEffect, useState, useMemo } from "react";
import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import { searchProductFranchisesService } from "../services/searchProductFranchises.service";
import { searchCategoryFranchisesService } from "../services/searchCategoryFranchises.service";
import type { ProductFranchise } from "@/models/product_franchise.model";
import type { CategoryFranchiseOption } from "../services/searchCategoryFranchises.service";
import { useAuthStore } from "@/stores/auth.store";
import { useAdminContextStore } from "@/stores/adminContext.store";

export type ProductCategoryFranchiseFormValues = {
  category_franchise_id: string;
  product_franchise_id: string;
  display_order: string;
};

export type ProductCategoryFranchiseInitialData = {
  id?: number | string;
  categoryFranchiseId?: number | string;
  productFranchiseId?: number | string;
  displayOrder?: number | string;
  isActive?: boolean;
  franchiseName?: string;
  categoryName?: string;
  productName?: string;
};

export const ProductCategoryFranchiseForm = ({
  mode,
  initialData,
  onSubmit,
  isOpen,
  isLoading,
  onClose,
}: {
  mode: "view" | "create" | "edit";
  initialData?: ProductCategoryFranchiseInitialData;
  onSubmit: (data: ProductCategoryFranchiseFormValues) => void;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductCategoryFranchiseFormValues>({
    defaultValues: { category_franchise_id: "", product_franchise_id: "", display_order: "1" },
  });

  const [categoryOptions, setCategoryOptions] = useState<CategoryFranchiseOption[]>([]);
  const [productOptions, setProductOptions] = useState<ProductFranchise[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Check if user is ADMIN (GLOBAL)
  const { user } = useAuthStore();
  const { selectedFranchiseId, franchises } = useAdminContextStore();

  const isGlobalAdmin = useMemo(() => {
    return user?.roles?.some(
      (r) => (r.role_code === "ADMIN" || r.role === "ADMIN") && r.scope === "GLOBAL"
    ) ?? false;
  }, [user]);

  // Get franchise name for display
  const currentFranchiseName = useMemo(() => {
    if (!selectedFranchiseId || selectedFranchiseId === "ALL") return null;
    const franchise = franchises.find((f) => String(f.id) === String(selectedFranchiseId));
    return franchise?.name || selectedFranchiseId;
  }, [selectedFranchiseId, franchises]);

  // Filter category options based on role
  const filteredCategoryOptions = useMemo(() => {
    if (isGlobalAdmin) {
      // ADMIN có thể thấy tất cả danh mục chi nhánh
      return categoryOptions;
    }

    // MANAGER/STAFF chỉ thấy danh mục của franchise họ đang quản lý
    if (!selectedFranchiseId || selectedFranchiseId === "ALL") {
      return categoryOptions;
    }

    return categoryOptions.filter(
      (cat) => String(cat.franchise_id) === String(selectedFranchiseId)
    );
  }, [categoryOptions, isGlobalAdmin, selectedFranchiseId]);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "create") {
      reset({ category_franchise_id: "", product_franchise_id: "", display_order: "1" });
    } else {
      reset({
        category_franchise_id: String(initialData?.categoryFranchiseId ?? ""),
        product_franchise_id: String(initialData?.productFranchiseId ?? ""),
        display_order: String(initialData?.displayOrder ?? 1),
      });
    }

    // Load options for both create and edit modes
    if (mode !== "view") {
      loadOptions();
    }
  }, [isOpen, initialData, mode, reset]);

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      const [catRes, prodRes] = await Promise.all([
        searchCategoryFranchisesService(),
        searchProductFranchisesService(),
      ]);
      if (catRes.success) setCategoryOptions(catRes.data ?? []);
      if (prodRes.success) setProductOptions(prodRes.data ?? []);
    } catch (e) {
      console.error("Không thể tải danh sách:", e);
    } finally {
      setLoadingOptions(false);
    }
  };

  const isView = mode === "view";

  return (
    <CRUDModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="sản phẩm vào danh mục"
      mode={mode}
      isLoading={isLoading}
      maxWidth="max-w-xl"
      onSave={() => document.getElementById("pcf-form-submit")?.click()}
    >
      <form
        id="pcf-form"
        onSubmit={handleSubmit(onSubmit)}
        className="w-full space-y-6"
      >
        <div className="grid grid-cols-1 gap-y-4">
          {isView ? (
            <>
              <FormInput
                label="Chi nhánh"
                register={register("category_franchise_id")}
                isView
                defaultValue={initialData?.franchiseName ?? "---"}
              />
              <FormInput
                label="Danh mục"
                register={register("category_franchise_id")}
                isView
                defaultValue={initialData?.categoryName ?? "---"}
              />
              <FormInput
                label="Sản phẩm"
                register={register("product_franchise_id")}
                isView
                defaultValue={initialData?.productName ?? "---"}
              />
              <FormInput
                label="Thứ tự hiển thị"
                register={register("display_order")}
                isView
                defaultValue={String(initialData?.displayOrder ?? "")}
              />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Trạng thái
                </span>
                <div className="py-2 border-b border-gray-100 min-h-[38px]">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      initialData?.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {initialData?.isActive ? "Đang hiển thị" : "Ẩn trên menu"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Danh mục chi nhánh */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Danh mục chi nhánh
                </label>
                {!isGlobalAdmin && currentFranchiseName && (
                  <p className="text-xs text-blue-600 mb-1">
                    Chỉ hiển thị danh mục của chi nhánh: <span className="font-semibold">{currentFranchiseName}</span>
                  </p>
                )}
                <select
                  {...register("category_franchise_id", { required: "Không được để trống" })}
                  disabled={loadingOptions}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">
                    {loadingOptions ? "Đang tải..." : "-- Chọn danh mục --"}
                  </option>
                  {filteredCategoryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.category_name ?? c.category_id} {c.franchise_name ? `(${c.franchise_name})` : ""}
                    </option>
                  ))}
                </select>
                {errors.category_franchise_id && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.category_franchise_id.message}
                  </p>
                )}
              </div>

              {/* Sản phẩm chi nhánh */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Sản phẩm chi nhánh
                </label>
                <select
                  {...register("product_franchise_id", { required: "Không được để trống" })}
                  disabled={loadingOptions}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">
                    {loadingOptions ? "Đang tải..." : "-- Chọn sản phẩm --"}
                  </option>
                  {productOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.product_name} {p.size ? `- ${p.size}` : ""} {p.franchise_name ? `(${p.franchise_name})` : ""}
                    </option>
                  ))}
                </select>
                {errors.product_franchise_id && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.product_franchise_id.message}
                  </p>
                )}
              </div>

              {/* Thứ tự hiển thị */}
              <FormInput
                label="Thứ tự hiển thị"
                placeholder="1"
                register={register("display_order", {
                  required: "Không được để trống",
                  pattern: { value: /^\d+$/, message: "Phải là số nguyên dương" },
                })}
                error={errors.display_order}
                isView={false}
                defaultValue={String(initialData?.displayOrder ?? "")}
              />
            </>
          )}
        </div>

        <button id="pcf-form-submit" type="submit" className="hidden" />
      </form>
    </CRUDModalTemplate>
  );
};
