/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAdminContextStore } from "@/stores";

import {
  CRUDPageTemplate,
  type Column,
} from "@/components/Admin/template/CRUDPage.template";
import ClientLoading from "@/components/Client/Client.Loading";
import { ActionConfirmModal } from "@/components/Admin/template/ActionConfirmModal";
import FormSelect from "@/components/Admin/form/FormSelect";

import { searchProductFranchiseUsecase } from "@/pages/admin/product/usecases/productFranchise/searchProductFranchise02.usecase";
import { changeStatusProductFranchiseUsecase } from "@/pages/admin/product/usecases/productFranchise/changeStatusProductFranchise07.usecase";
import { deleteProductFranchiseUsecase } from "@/pages/admin/product/usecases/productFranchise/deleteProductFranchise.05usecase";
import { restoreProductFranchiseUsecase } from "@/pages/admin/product/usecases/productFranchise/restoreProductFranchise06.usecase";
import { createProductFranchiseUsecase } from "@/pages/admin/product/usecases/productFranchise/createProductFranchise01.usecase";
import { updateProductFranchiseUsecase } from "@/pages/admin/product/usecases/productFranchise/updateProductFranchise04.usecase";

import type { ProductFranchise } from "@/components/cart/models/productResponse.model";
import { FormInput } from "@/components/Admin/form/FormInput";
import { ProductFranchiseForm } from "@/pages/admin/product/components/ProductFranchiseForm";

import { can } from "@/auth/rbac";
import { PERM } from "@/auth/rbac.permissions";
import { useAuthStore } from "@/stores/auth.store";

const ProductFranchisePage = () => {
  const selectedFranchiseId = useAdminContextStore(
    (s) => s.selectedFranchiseId,
  );
  const isAdmin = selectedFranchiseId === null;
  const user = useAuthStore((s) => s.user);
  const canWrite = can(user, PERM.PRODUCT_FRANCHISE_WRITE, selectedFranchiseId);
  const [currentFilters, setCurrentFilters] = useState<any>({
    is_active: "",
    is_deleted: "false",
  });

  const { register, getValues, setValue, watch } = useForm({
    defaultValues: {
      franchise_id: selectedFranchiseId || "",
      product_id: "",
      size: "",
      price_from: "",
      price_to: "",
    },
  });

  const [productList, setProductList] = useState<ProductFranchise[]>([]);
  const [franchiseOptions, setFranchiseOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [productOptions, setProductOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [size, setSize] = useState<{ value: string; label: string }[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "delete" | "restore";
    item: ProductFranchise | null;
  }>({ isOpen: false, type: "delete", item: null });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [selectedItem, setSelectedItem] = useState<ProductFranchise | null>(
    null,
  );
  const [rawProductFranchiseList, setRawProductFranchiseList] = useState<any[]>(
    [],
  );

  const fetchFilterOptions = useCallback(async () => {
    try {
      const res = await searchProductFranchiseUsecase({
        searchCondition: {
          franchise_id: selectedFranchiseId || "",
          product_id: "",
          size: "",
          price_from: "",
          price_to: "",
          is_active: "",
          is_deleted: "false",
        },
        pageInfo: { pageNum: 1, pageSize: 10000 },
      });
      if (res.success && res.data) {
        setRawProductFranchiseList(res.data);
        const fMap = new Map();
        const pMap = new Map();
        const sMap = new Map();
        res.data.forEach((item: any) => {
          if (item.franchise_id)
            fMap.set(String(item.franchise_id), item.franchise_name);
          if (item.product_id)
            pMap.set(String(item.product_id), item.product_name);
          if (item.size) sMap.set(String(item.size), `Size ${item.size}`);
        });
        setFranchiseOptions(
          Array.from(fMap, ([value, label]) => ({ value, label })),
        );
        setProductOptions(
          Array.from(pMap, ([value, label]) => ({ value, label })),
        );
        setSize(
          Array.from(sMap, ([value, label]) => ({ value, label })).sort(
            (a, b) =>
              a.value.localeCompare(b.value, undefined, { numeric: true }),
          ),
        );
      }
    } catch (e) {
      console.error("Lỗi lấy filter options:", e);
    }
  }, [selectedFranchiseId]);

  const fetchProducts = useCallback(
    async (
      pageNum = 1,
      type: "full" | "table" = "full",
      size = pageSize,
      searchParams?: { searchTerm?: string; filters?: any; formData?: any },
    ) => {
      try {
        if (type === "full") setIsLoading(true);
        if (type === "table") setIsTableLoading(true);
        const currentFormData = searchParams?.formData || getValues();
        const filters = searchParams?.filters || currentFilters;
        const res = await searchProductFranchiseUsecase({
          searchCondition: {
            franchise_id:
              currentFormData.franchise_id || selectedFranchiseId || "",
            product_id: currentFormData.product_id || "",
            price_from: currentFormData.price_from || "",
            price_to: currentFormData.price_to || "",

            size: filters.size || "",
            is_active:
              filters.is_active === "true"
                ? true
                : filters.is_active === "false"
                  ? false
                  : "",
            is_deleted:
              filters.is_deleted === "true"
                ? true
                : filters.is_deleted === "false"
                  ? false
                  : "",
          },
          pageInfo: { pageNum, pageSize: size },
        });
        if (res.success) {
          setProductList(res.data as any);
          setTotalItems(res.pageInfo.totalItems);
          setPage(res.pageInfo.pageNum);
        }
      } catch {
        toast.error("Lỗi kết nối hệ thống");
      } finally {
        setIsLoading(false);
        setIsTableLoading(false);
      }
    },
    [pageSize, selectedFranchiseId, getValues, currentFilters],
  );

  useEffect(() => {
    fetchFilterOptions();
    fetchProducts(1, "full");
  }, [fetchFilterOptions]);

  const handleSearch = (term?: string, filters?: any) => {
    setCurrentFilters(filters);
    const currentForm = getValues();
    fetchProducts(1, "table", pageSize, {
      searchTerm: term,
      filters: filters,
      formData: currentForm,
    });
  };

  const handleSubmitForm = async (data: ProductFranchise, setError: any) => {
    setIsProcessing(true);
    try {
      if (formMode === "create") {
        await createProductFranchiseUsecase(data);
        toast.success("Thêm sản phẩm thành công");
      } else {
        await updateProductFranchiseUsecase(selectedItem!.id, data);
        toast.success("Cập nhật thông tin thành công");
      }
      setIsFormOpen(false);
      fetchProducts(page, "full");
    } catch (error: any) {
      const errData = error.response?.data || error;
      const serverErrors = errData?.errors;

      if (Array.isArray(serverErrors)) {
        serverErrors.forEach((e) => {
          setError(e.field as keyof ProductFranchise, { message: e.message });
          toast.error(e.message);
        });
      } else {
        toast.error(errData?.message || "Thao tác thất bại!");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = async (
    item: ProductFranchise,
    newStatus: boolean,
  ) => {
    try {
      setIsLoading(true);
      const res = await changeStatusProductFranchiseUsecase(item.id, newStatus);
      if (res) {
        setProductList((prev) =>
          prev.map((p) =>
            p.id === item.id ? { ...p, is_active: newStatus } : p,
          ),
        );
        toast.success("Cập nhật trạng thái thành công");
      }
    } catch {
      toast.error("Thao tác thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    const { type, item } = modalConfig;
    if (!item) return;
    try {
      if (type === "delete") await deleteProductFranchiseUsecase(item.id);
      else await restoreProductFranchiseUsecase(item.id);
      setModalConfig((prev) => ({ ...prev, isOpen: false }));
      fetchProducts(page, "full");
      toast.success(
        type === "delete" ? "Đã chuyển vào thùng rác" : "Khôi phục thành công",
      );
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

  const handleRefresh = () => {
    const defaults = {
      franchise_id: selectedFranchiseId || "",
      product_id: "",
      price_from: "",
      price_to: "",
    };
    setValue("franchise_id", defaults.franchise_id);
    setValue("product_id", "");
    setValue("price_from", "");
    setValue("price_to", "");
    const defaultFilters = { is_active: "", is_deleted: "false" };
    setCurrentFilters(defaultFilters);
    fetchProducts(1, "full", pageSize, {
      formData: defaults,
      filters: defaultFilters,
    });
    toast.success("Làm mới thành công");
  };

  const columns: Column<ProductFranchise>[] = useMemo(
    () => [
      { header: "Chi nhánh", accessor: "franchise_name", hidden: !isAdmin },
      {
        header: "Sản phẩm",
        accessor: "product_name",
        className: "font-semibold text-blue-600",
      },
      { header: "Size", accessor: "size" },
      {
        header: "Giá cơ bản",
        accessor: "price_base",
        render: (item) => (
          <span className="font-bold text-green-600">
            {item.price_base?.toLocaleString()}đ
          </span>
        ),
      },
    ],
    [isAdmin],
  );

  return (
    <>
      {isLoading && <ClientLoading />}

      <CRUDPageTemplate<ProductFranchise>
        title="Quản lý sản phẩm theo chi nhánh"
        data={productList}
        columns={columns}
        pageSize={pageSize}
        totalItems={totalItems}
        currentPage={page}
        onPageChange={(p) => fetchProducts(p, "table")}
        onPageSizeChange={(s) => {
          setPageSize(s);
          fetchProducts(1, "full", s);
        }}
        isTableLoading={isTableLoading}
        searchContent={
          <div className="flex flex-wrap items-center gap-3 w-full">
            {isAdmin && (
              <div className="flex-1">
                <FormSelect
                  label=""
                  options={[
                    { label: "Tất cả chi nhánh", value: "" },
                    ...franchiseOptions,
                  ]}
                  register={register("franchise_id")}
                  value={watch("franchise_id")}
                  placeholder="Chọn chi nhánh"
                  onChange={(v) => setValue("franchise_id", v)}
                />
              </div>
            )}

            <div className="flex-1">
              <FormSelect
                label=""
                options={[
                  { label: "Tất cả sản phẩm", value: "" },
                  ...productOptions,
                ]}
                register={register("product_id")}
                value={watch("product_id")}
                placeholder="Chọn sản phẩm"
                onChange={(v) => setValue("product_id", v)}
              />
            </div>

            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1">
                <FormInput
                  label=""
                  type="number"
                  placeholder="Giá từ..."
                  register={register("price_from")}
                />
              </div>
              <span className="text-gray-500">-</span>
              <div className="flex-1">
                <FormInput
                  label=""
                  type="number"
                  placeholder="đến..."
                  register={register("price_to")}
                />
              </div>
            </div>
          </div>
        }
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onAdd={
          canWrite
            ? () => {
                setFormMode("create");
                setSelectedItem(null);
                setIsFormOpen(true);
              }
            : undefined
        }
        onEdit={
          canWrite
            ? (item) => {
                setFormMode("edit");
                setSelectedItem(item);
                setIsFormOpen(true);
              }
            : undefined
        }
        onView={(item) => {
          setFormMode("view");
          setSelectedItem(item);
          setIsFormOpen(true);
        }}
        onDelete={
          canWrite
            ? (item) => setModalConfig({ isOpen: true, type: "delete", item })
            : undefined
        }
        onRestore={
          canWrite
            ? (item) => setModalConfig({ isOpen: true, type: "restore", item })
            : undefined
        }
        onStatusChange={canWrite ? handleStatusChange : undefined}
        statusField="is_active"
        filters={[
          { key: "size", label: "kích cỡ", options: size },
          {
            key: "is_active",
            label: "trạng thái",
            options: [
              { value: "true", label: "Hoạt động" },
              { value: "false", label: "Ngưng hoạt động" },
            ],
          },
          {
            key: "is_deleted",
            label: "trạng thái xóa",
            options: [
              { value: "false", label: "Còn tồn tại" },
              { value: "true", label: "Đã xóa" },
            ],
          },
        ]}
      />

      <ActionConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        type={modalConfig.type}
        title={
          modalConfig.type === "delete" ? "Xác nhận xóa" : "Xác nhận khôi phục"
        }
        message={
          modalConfig.type === "delete"
            ? `Bạn có chắc muốn xóa sản phẩm "${modalConfig.item?.product_name}"?`
            : `Khôi phục sản phẩm "${modalConfig.item?.product_name}"?`
        }
      />

      <ProductFranchiseForm
        isOpen={isFormOpen}
        mode={formMode}
        initialData={selectedItem}
        isLoading={isProcessing}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSubmitForm}
        isAdmin={isAdmin}
        selectedFranchiseId={selectedFranchiseId || undefined}
        existingDataList={rawProductFranchiseList}
      />
    </>
  );
};

export default ProductFranchisePage;
