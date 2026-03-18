import { FormInput } from "@/components/Admin/form/FormInput";
import FormSelect from "@/components/Admin/form/FormSelect";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState, useMemo } from "react";
import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import { searchProductFranchisesService } from "../services/searchProductFranchises.service";
import { searchCategoryFranchisesService } from "../services/searchCategoryFranchises.service";
import { searchProductCategoryFranchisesService } from "../services/productCategoryFranchise.service";
import type { ProductFranchise } from "@/models/product_franchise.model";
import type { CategoryFranchiseOption } from "../services/searchCategoryFranchises.service";
import { useAuthStore } from "@/stores/auth.store";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { toastError } from "@/utils/toast.util";

export type ProductCategoryFranchiseFormValues = {
  franchise_id?: string;
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

export type ExistingProductCategoryMapping = {
  category_franchise_id: string;
  product_franchise_id: string;
};

export const ProductCategoryFranchiseForm = ({
  mode,
  initialData,
  existingMappings = [],
  onSubmit,
  isOpen,
  isLoading,
  onClose,
}: {
  mode: "view" | "create" | "edit";
  initialData?: ProductCategoryFranchiseInitialData;
  existingMappings?: ExistingProductCategoryMapping[];
  onSubmit: (data: ProductCategoryFranchiseFormValues) => void;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductCategoryFranchiseFormValues>({
    defaultValues: {
      franchise_id: "",
      category_franchise_id: "",
      product_franchise_id: "",
      display_order: "",
    },
  });

  const [franchiseOptions, setFranchiseOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [categoryOptions, setCategoryOptions] = useState<
    CategoryFranchiseOption[]
  >([]);
  const [productOptions, setProductOptions] = useState<ProductFranchise[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [displayOrderOptions, setDisplayOrderOptions] = useState<number[]>([]);
  const [usedDisplayOrders, setUsedDisplayOrders] = useState<Set<number>>(
    () => new Set(),
  );

  const formRef = useRef<HTMLFormElement>(null);

  // Check if user is ADMIN (GLOBAL)
  const { user } = useAuthStore();
  const { selectedFranchiseId: ctxFranchiseId } = useAdminContextStore();

  const roleManagedFranchiseId = useMemo(() => {
    const franchiseRole = user?.roles?.find((r) => {
      const roleFranchiseId =
        r.franchise_id ??
        (r as { franchiseId?: string | number } | undefined)?.franchiseId;
      return r.scope === "FRANCHISE" && roleFranchiseId != null;
    });

    const resolvedFranchiseId =
      franchiseRole?.franchise_id ??
      (franchiseRole as { franchiseId?: string | number } | undefined)
        ?.franchiseId;

    return resolvedFranchiseId != null ? String(resolvedFranchiseId) : "";
  }, [user]);

  const contextFranchiseId = useMemo(() => {
    if (!ctxFranchiseId || ctxFranchiseId === "ALL") return "";
    return String(ctxFranchiseId);
  }, [ctxFranchiseId]);

  const formFranchiseId = watch("franchise_id");
  const formProductFranchiseId = watch("product_franchise_id");
  const formDisplayOrder = watch("display_order");

  const isGlobalAdmin = useMemo(() => {
    return (
      user?.roles?.some(
        (r) =>
          (r.role_code === "ADMIN" || r.role === "ADMIN") &&
          r.scope === "GLOBAL",
      ) ?? false
    );
  }, [user]);

  const managedFranchiseId =
    contextFranchiseId || (!isGlobalAdmin ? roleManagedFranchiseId : "");

  const activeFranchiseId = formFranchiseId || managedFranchiseId;

  const createDefaultFranchiseId = managedFranchiseId;

  // Get franchise name for display
  const currentFranchiseName = useMemo(() => {
    if (!activeFranchiseId || activeFranchiseId === "ALL") return null;
    const franchise = franchiseOptions.find(
      (f) => String(f.id) === String(activeFranchiseId),
    );
    return franchise?.name || activeFranchiseId;
  }, [activeFranchiseId, franchiseOptions]);

  // categoryOptions is loaded server-side by franchise_id
  const filteredCategoryOptions = categoryOptions;

  const selectedCategoryFranchiseId = watch("category_franchise_id");

  const selectedCategoryOption = useMemo(
    () =>
      filteredCategoryOptions.find(
        (category) =>
          String(category.id) === String(selectedCategoryFranchiseId),
      ),
    [filteredCategoryOptions, selectedCategoryFranchiseId],
  );

  const hasBootstrappedFranchises = useRef(false);

  const loadFranchiseOptions = async () => {
    const res = await searchCategoryFranchisesService("");
    if (!res.success) return;
    const map = new Map<string, string>();
    (res.data ?? []).forEach((item) => {
      if (!item.franchise_id) return;
      map.set(
        String(item.franchise_id),
        String(item.franchise_name ?? item.franchise_id),
      );
    });
    setFranchiseOptions(
      Array.from(map.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name, "vi")),
    );
  };

  const loadOptionsForFranchise = async (franchiseId: string) => {
    try {
      setLoadingOptions(true);
      const [catRes, prodRes] = await Promise.all([
        searchCategoryFranchisesService(franchiseId),
        searchProductFranchisesService(franchiseId),
      ]);

      setCategoryOptions(catRes.success ? (catRes.data ?? []) : []);
      setProductOptions(prodRes.success ? (prodRes.data ?? []) : []);
    } catch (e) {
      console.error("Không thể tải danh sách:", e);
      setCategoryOptions([]);
      setProductOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (mode === "view") return;
    if (!isOpen) return;

    // GLOBAL admin: build franchise dropdown without /api/franchises
    if (isGlobalAdmin && !hasBootstrappedFranchises.current) {
      hasBootstrappedFranchises.current = true;
      loadFranchiseOptions();
    }

    const franchiseIdToLoad = isGlobalAdmin
      ? String(formFranchiseId || "")
      : managedFranchiseId;

    // Nếu không có franchiseId cụ thể, vẫn load tất cả để user chọn được
    loadOptionsForFranchise(franchiseIdToLoad);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isGlobalAdmin, managedFranchiseId]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode !== "create") return;

    setValue("franchise_id", createDefaultFranchiseId);
  }, [isOpen, mode, createDefaultFranchiseId, setValue]);

  useEffect(() => {
    if (mode === "view") return;
    if (!isOpen) return;
    if (!isGlobalAdmin) return;

    // When GLOBAL franchise changes, reset downstream fields and reload options server-side
    setValue("category_franchise_id", "");
    setValue("product_franchise_id", "");
    setValue("display_order", "");

    // Nếu GLOBAL admin chưa chọn chi nhánh, vẫn cho phép load tất cả
    const franchiseIdToLoad = String(formFranchiseId || "");
    loadOptionsForFranchise(franchiseIdToLoad);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formFranchiseId, isOpen, isGlobalAdmin, mode, setValue]);

  const filteredProductOptions = useMemo(() => {
    if (!selectedCategoryFranchiseId || !selectedCategoryOption?.id) {
      return [];
    }

    const categoryFranchiseId = String(
      selectedCategoryOption.franchise_id ?? activeFranchiseId ?? "",
    );

    if (!categoryFranchiseId) {
      return [];
    }

    return productOptions.filter(
      (product) => String(product.franchise_id) === categoryFranchiseId,
    );
  }, [
    productOptions,
    activeFranchiseId,
    selectedCategoryFranchiseId,
    selectedCategoryOption,
  ]);

  const usedProductFranchiseIdsInSelectedCategory = useMemo(() => {
    if (!selectedCategoryFranchiseId) {
      return new Set<string>();
    }

    return new Set(
      existingMappings
        .filter(
          (mapping) =>
            mapping.category_franchise_id ===
            String(selectedCategoryFranchiseId),
        )
        .map((mapping) => mapping.product_franchise_id),
    );
  }, [existingMappings, selectedCategoryFranchiseId]);

  useEffect(() => {
    if (mode !== "create") {
      return;
    }
    setValue("product_franchise_id", "");
    setValue("display_order", "");
    setUsedDisplayOrders(new Set());
    setDisplayOrderOptions([]);
  }, [mode, selectedCategoryFranchiseId, setValue]);

  useEffect(() => {
    const run = async () => {
      if (mode === "view") return;
      if (!isOpen) return;
      if (
        !selectedCategoryOption?.franchise_id ||
        !selectedCategoryOption?.category_id
      ) {
        setUsedDisplayOrders(new Set());
        setDisplayOrderOptions([]);
        return;
      }

      try {
        const res = await searchProductCategoryFranchisesService({
          searchCondition: {
            franchise_id: String(selectedCategoryOption.franchise_id),
            category_id: String(selectedCategoryOption.category_id),
            product_id: "",
            is_active: "",
            is_deleted: false,
          },
          pageInfo: { pageNum: 1, pageSize: 10000 },
        });

        const used = new Set<number>();
        (res.data ?? []).forEach((item) => {
          const value = Number(
            (item as unknown as Record<string, unknown>).display_order ?? 0,
          );
          if (Number.isFinite(value) && value > 0) used.add(value);
        });

        const max = used.size ? Math.max(...Array.from(used)) : 0;
        const nextMax = Math.max(max + 1, 1);
        // chọn vị trí trống đầu tiên (nếu có lỗ hổng), nếu không thì chọn cuối danh sách
        const firstFree =
          Array.from({ length: nextMax - 1 }, (_, i) => i + 1).find(
            (i) => !used.has(i),
          ) ?? nextMax;

        setUsedDisplayOrders(used);
        setDisplayOrderOptions(
          Array.from({ length: nextMax }, (_, i) => i + 1),
        );
        setValue("display_order", String(firstFree));
      } catch (error) {
        console.error("Không thể tải display_order:", error);
        setUsedDisplayOrders(new Set());
        setDisplayOrderOptions([]);
      }
    };

    run();
  }, [
    mode,
    isOpen,
    selectedCategoryOption?.franchise_id,
    selectedCategoryOption?.category_id,
  ]);

  // NOTE: Do NOT reload options by selected category's franchise.
  // Options are loaded strictly by the currently selected franchise (GLOBAL) or context franchise (LOCAL),
  // otherwise the category dropdown will "jump" and show other franchises.

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "create") {
      reset({
        franchise_id: createDefaultFranchiseId,
        category_franchise_id: "",
        product_franchise_id: "",
        display_order: "",
      });
    } else {
      reset({
        franchise_id: managedFranchiseId,
        category_franchise_id: String(initialData?.categoryFranchiseId ?? ""),
        product_franchise_id: String(initialData?.productFranchiseId ?? ""),
        display_order: String(initialData?.displayOrder ?? ""),
      });
    }

    // Load options for both create and edit modes
    if (mode !== "view") {
      // options are loaded by effects (server-side cascade)
    }
  }, [isOpen, initialData, mode, reset, managedFranchiseId]);

  // loadOptions removed: now loadOptionsForFranchise + loadFranchiseOptions are used.

  const isView = mode === "view";

  return (
    <CRUDModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="sản phẩm vào danh mục"
      mode={mode}
      isLoading={isLoading}
      maxWidth="max-w-xl"
      onSave={() => formRef.current?.requestSubmit()}
    >
      <form
        id="pcf-form"
        ref={formRef}
        onSubmit={handleSubmit(
          (data) => {
            // Remove franchise_id before submitting (only needed for filtering in form)
            const { franchise_id: _, ...submitData } = data;
            onSubmit(submitData);
          },
          (submitErrors) => {
            const firstKey = Object.keys(submitErrors)[0] as
              | keyof typeof submitErrors
              | undefined;
            const message =
              firstKey && submitErrors[firstKey]?.message
                ? String(submitErrors[firstKey]?.message)
                : "Vui lòng kiểm tra lại thông tin nhập";
            toastError(message);
          },
        )}
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
              {/* Chi nhánh */}
              {isGlobalAdmin && (
                <FormSelect
                  label="Chi nhánh"
                  options={[
                    {
                      value: "",
                      label: loadingOptions
                        ? "Đang tải..."
                        : "-- Chọn chi nhánh --",
                    },
                    ...franchiseOptions.map((f) => ({
                      value: String(f.id),
                      label: f.name,
                    })),
                  ]}
                  register={register("franchise_id")}
                  value={String(formFranchiseId || "")}
                  error={errors.franchise_id}
                  placeholder="Chọn chi nhánh"
                />
              )}

              {/* Danh mục chi nhánh */}
              {!isGlobalAdmin && currentFranchiseName && (
                <p className="text-xs text-blue-600 mb-2">
                  Chi nhánh:{" "}
                  <span className="font-semibold">{currentFranchiseName}</span>
                </p>
              )}
              <FormSelect
                label="Danh mục chi nhánh"
                options={[
                  {
                    value: "",
                    label: loadingOptions
                      ? "Đang tải..."
                      : "-- Chọn danh mục --",
                  },
                  ...filteredCategoryOptions.map((c) => ({
                    value: String(c.id),
                    label: `${c.category_name ?? c.category_id} ${c.franchise_name ? `(${c.franchise_name})` : ""}`,
                  })),
                ]}
                register={register("category_franchise_id", {
                  required: "Không được để trống",
                })}
                value={String(selectedCategoryFranchiseId || "")}
                error={errors.category_franchise_id}
                placeholder="Chọn danh mục"
              />

              {/* Sản phẩm chi nhánh */}
              <FormSelect
                label="Sản phẩm chi nhánh"
                options={[
                  {
                    value: "",
                    label: loadingOptions
                      ? "Đang tải..."
                      : !selectedCategoryFranchiseId
                        ? "-- Chọn danh mục trước --"
                        : "-- Chọn sản phẩm --",
                  },
                  ...filteredProductOptions.map((p) => ({
                    value: String(p.id),
                    label: `${p.product_name} ${p.size ? `- ${p.size}` : ""} ${p.franchise_name ? `(${p.franchise_name})` : ""} ${usedProductFranchiseIdsInSelectedCategory.has(String(p.id)) ? "✓" : ""}`,
                  })),
                ]}
                register={register("product_franchise_id", {
                  required: "Không được để trống",
                })}
                value={String(formProductFranchiseId || "")}
                error={errors.product_franchise_id}
                placeholder="Chọn sản phẩm"
              />
              {mode === "create" && selectedCategoryFranchiseId && (
                <p className="text-xs text-amber-600">
                  Các sản phẩm có nhãn "✓" đã tồn tại trong danh mục này.
                </p>
              )}

              {/* Thứ tự hiển thị */}
              <FormSelect
                label="Thứ tự hiển thị"
                options={[
                  { value: "", label: "-- Để trống (thêm cuối) --" },
                  ...displayOrderOptions.map((order) => ({
                    value: String(order),
                    label: usedDisplayOrders.has(order)
                      ? `${order} ✓`
                      : String(order),
                  })),
                ]}
                register={register("display_order")}
                value={String(formDisplayOrder || "")}
                placeholder="Chọn vị trí"
              />
              <p className="text-xs text-gray-500">
                Để trống sẽ thêm sản phẩm vào cuối danh sách.
              </p>
            </>
          )}
        </div>

        <button id="pcf-form-submit" type="submit" className="hidden" />
      </form>
    </CRUDModalTemplate>
  );
};
