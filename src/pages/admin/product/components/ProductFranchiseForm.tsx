/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Loader2, MapPin, Layers, Info, Plus, Package } from "lucide-react";

import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import FormSelect from "@/components/Admin/form/FormSelect";
import { FormInput } from "@/components/Admin/form/FormInput";
import type { ProductFranchise } from "@/components/cart/models/productResponse.model";

import { getAllFranchises } from "@/components/categoryFranchise/services/franchise08.service";
import { getSelectProductsService } from "@/pages/admin/product/services";
import {
  ProductFranchiseSchema,
  type ProductFranchiseFormValues,
} from "@/pages/admin/product/schema/ProductFranchiseSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { getProductDetailService } from "@/pages/admin/product/services/productAdmin.service";

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

// Các size phổ biến để gợi ý - hiển thị ngay khi mở modal
const COMMON_SIZES = ["S", "M", "L", "XL"];

export const ProductFranchiseForm = ({
  isOpen,
  mode,
  initialData,
  onClose,
  onSave,
  isLoading,
  existingDataList = [],
  isAdmin,
  selectedFranchiseId,
}: ProductFranchiseFormProps) => {
  const [isReady, setIsReady] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [franchiseOptions, setFranchiseOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [productOptions, setProductOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedProductDetail, setSelectedProductDetail] = useState<{
    min_price: number;
    max_price: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ProductFranchiseFormValues>({
    resolver: zodResolver(ProductFranchiseSchema) as any,
    mode: "onChange",
  });

  const isView = mode === "view";
  const watchedFranchiseId = watch("franchise_id");
  const watchedProductId = watch("product_id");
  const watchedPriceBase = watch("price_base");

  // Lấy danh sách các size đã tồn tại cho sản phẩm + chi nhánh đã chọn
  const existingSizesForProduct = useMemo(() => {
    if (!watchedProductId || !watchedFranchiseId) return [];

    const matches = existingDataList.filter(
      (item) =>
        String(item.product_id) === String(watchedProductId) &&
        String(item.franchise_id) === String(watchedFranchiseId),
    );

    return matches;
  }, [watchedProductId, watchedFranchiseId, existingDataList]);

  // Lấy danh sách size đã có (chỉ lấy tên size)
  const existingSizeNames = useMemo(() => {
    return existingSizesForProduct.map(item => item.size?.toUpperCase() || "");
  }, [existingSizesForProduct]);

  // Lấy chi tiết sản phẩm
  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!watchedProductId) {
        setSelectedProductDetail(null);
        return;
      }

      setIsLoadingProduct(true);
      try {
        const response = await getProductDetailService(watchedProductId);
        if (response?.success && response?.data) {
          setSelectedProductDetail({
            min_price: response.data.min_price,
            max_price: response.data.max_price,
          });

          // Gợi ý giá: nếu chưa nhập giá, set giá mặc định là min_price
          if (!watchedPriceBase && response.data.min_price) {
            setValue("price_base", response.data.min_price);
          }
        } else {
          setSelectedProductDetail(null);
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
        setSelectedProductDetail(null);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProductDetail();
  }, [watchedProductId, setValue]);

  useEffect(() => {
    if (!isOpen) {
      reset({
        franchise_id: isAdmin ? "" : String(selectedFranchiseId || ""),
        product_id: "",
        size: "",
        price_base: 0,
      }); 
      setSelectedProductDetail(null);
      setIsReady(false);
      return;
    }

    const initForm = async () => {
      try {
        const [franchiseRes, productRes] = await Promise.all([
          getAllFranchises(),
          getSelectProductsService(),
        ]);

        if (franchiseRes) {
          setFranchiseOptions(
            franchiseRes.map((f: any) => ({ label: f.name, value: f.value })),
          );
        }
        if (productRes) {
          setProductOptions(
            productRes.map((p: any) => ({ label: p.name, value: p.id })),
          );
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
          // Nếu là edit, lấy chi tiết sản phẩm để hiển thị giá tham khảo
          if (initialData.product_id) {
            try {
              const response = await getProductDetailService(initialData.product_id);
              if (response?.success && response?.data) {
                setSelectedProductDetail({
                  min_price: response.data.min_price,
                  max_price: response.data.max_price,
                });
              }
            } catch (err) {
              console.error("Lỗi lấy chi tiết sản phẩm khi edit:", err);
            }
          }
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
    const sizeArray = Array.from(
      new Set(items.map((m) => String(m.size || "").trim())),
    );

    const sizeOrder: Record<string, number> = {
      S: 1,
      M: 2,
      L: 3,
      XL: 4,
      XXL: 5,
      "2XL": 5,
      "3XL": 6,
      "1 LÍT": 7,
    };

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
      title={
        mode === "view"
          ? "Sản phẩm chi nhánh"
          : mode === "edit"
            ? "Cập nhật sản phẩm"
            : "Thêm mới sản phẩm chi nhánh"
      }
      onSave={() =>
        document.getElementById("product-franchise-submit-btn")?.click()
      }
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
            <p className="mt-4 text-sm font-medium text-gray-500">
              Đang chuẩn bị dữ liệu...
            </p>
          </div>
        )}

        <div className="space-y-6">
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border transition-all duration-300 ${errors.franchise_id || errors.product_id ? "border-primary/30 bg-primary/2" : "border-gray-200 bg-white shadow-sm"}`}
          >
            <div className="col-span-2 flex items-center gap-2 text-blue-700 font-bold border-b pb-3 border-gray-100">
              <MapPin size={20} /> <span>Thông tin phân phối</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-600">
                Chi nhánh áp dụng:
              </label>

              {isView || !isAdmin ? (
                <div className="py-2.5 text-gray-700 font-medium flex items-center justify-between">
                  <span>
                    {franchiseOptions.find(
                      (opt) =>
                        opt.value ===
                        String(
                          watch("franchise_id") ||
                          initialData?.franchise_id ||
                          selectedFranchiseId,
                        ),
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
              <label className="text-sm font-semibold text-gray-600">
                Sản phẩm:
              </label>
              {isView ? (
                <div className="py-2.5 text-gray-700 font-medium">
                  {productOptions.find(
                    (opt) => opt.value === watch("product_id"),
                  )?.label || "---"}
                </div>
              ) : (
                <>
                  <FormSelect
                    options={productOptions.map((opt) => {
                      const fId = String(
                        watchedFranchiseId || selectedFranchiseId || "",
                      );
                      const matches = existingDataList.filter(
                        (item) =>
                          String(item.product_id) === String(opt.value) &&
                          String(item.franchise_id) === fId,
                      );
                      const sortedSizes = getSortedSizes(matches);
                      const displaySizes = sortedSizes.join(", ");
                      return {
                        value: opt.value,
                        label:
                          matches.length > 0
                            ? `${opt.label} (Đã có: ${displaySizes})`
                            : opt.label,
                        isExisting: matches.length > 0,
                      };
                    })}
                    register={register("product_id")}
                    value={watchedProductId}
                    placeholder="Chọn sản phẩm"
                    error={errors.product_id}
                  />
                </>
              )}
            </div>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border transition-all duration-300 ${errors.price_base || errors.size ? "border-primary/30 bg-primary/2" : "border-gray-200 bg-white shadow-sm"}`}
          >
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

              {/* PHẦN SIZE PHỔ BIẾN - HIỂN THỊ NGAY KHI MỞ MODAL (không cần chọn sản phẩm) */}
              {!isView && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Plus size={14} className="text-blue-500" />
                    <span className="text-xs text-gray-500">Size phổ biến:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_SIZES.map((size, idx) => {
                      // Chỉ kiểm tra đã có size nếu đã chọn sản phẩm
                      const isExisting = watchedProductId ? existingSizeNames.includes(size) : false;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isExisting}
                          onClick={() => !isExisting && setValue("size", size)}
                          className={`text-[13px] px-3 py-1 rounded-md transition-all cursor-pointer
                            ${isExisting
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                            }`}
                        >
                          {size} {isExisting && "(đã có)"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PHẦN CẦN LOADING: Đã có size tại chi nhánh */}
              <div className="mt-3 min-h-25">
                {!isView && watchedProductId && (
                  <>
                    {isLoadingProduct ? (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-xs">Đang tải size đã có...</span>
                        </div>
                      </div>
                    ) : (
                      existingSizesForProduct.length > 0 && (
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Package size={14} className="text-orange-600" />
                            <span className="text-xs font-medium text-orange-700">
                              Size đã có tại chi nhánh:
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {existingSizesForProduct.map((item, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-white px-2 py-1 rounded border border-orange-200 text-orange-700"
                              >
                                {item.size} - {item.price_base.toLocaleString()}đ
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
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

              {/* PHẦN CẦN LOADING: Giá tham khảo */}
              <div className="mt-2 min-h-20">
                {!isView && watchedProductId && (
                  <>
                    {isLoadingProduct ? (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-xs">Đang tải giá tham khảo...</span>
                        </div>
                      </div>
                    ) : (
                      selectedProductDetail && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Info size={14} className="text-green-600" />
                            <span className="text-xs font-medium text-green-700">
                              Giá tham khảo:
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedProductDetail.min_price === selectedProductDetail.max_price ? (
                              <span className="text-sm font-semibold text-green-700">
                                {selectedProductDetail.min_price.toLocaleString()}đ
                              </span>
                            ) : (
                              <>
                                <span className="text-sm font-semibold text-green-700">
                                  {selectedProductDetail.min_price.toLocaleString()}đ
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className="text-sm font-semibold text-green-700">
                                  {selectedProductDetail.max_price.toLocaleString()}đ
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          id="product-franchise-submit-btn"
          type="submit"
          className="hidden"
        />
      </form>
    </CRUDModalTemplate>
  );
};