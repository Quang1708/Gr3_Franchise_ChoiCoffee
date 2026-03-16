import { useEffect, useState } from "react";
import {
  CRUDPageTemplate,
  type Column,
} from "@/components/Admin/template/CRUDPage.template";
import { ActionConfirmModal } from "@/components/Admin/template/ActionConfirmModal";
import ClientLoading from "@/components/Client/Client.Loading";
import { useAuthStore } from "@/stores/auth.store";
import { toastError, toastSuccess } from "@/utils/toast.util";
import { ArrowDown, ArrowUp } from "lucide-react";

import type { ProductCategoryFranchise } from "@/models/product_category_franchise.model";
import {
  reorderProductCategoryFranchisesService,
  searchProductCategoryFranchisesService,
} from "./services/productCategoryFranchise.service";
import { createProductCategoryFranchiseUsecase } from "./usecases/create.usecase";
import { deleteProductCategoryFranchiseUsecase } from "./usecases/delete.usecase";
import { restoreProductCategoryFranchiseUsecase } from "./usecases/restore.usecase";
import { updateProductCategoryFranchiseStatusUsecase } from "./usecases/updateStatus.usecase";
import {
  ProductCategoryFranchiseForm,
  type ProductCategoryFranchiseFormValues,
} from "./components/ProductCategoryFranchiseForm";

import type { ProductCategoryFranchiseSearchInput } from "./schema/productCategoryFranchise.schema";
import FormSelect from "@/components/Admin/Form/FormSelect";
import { useForm, type FieldError } from "react-hook-form";

type ProductCategoryFranchiseRow = ProductCategoryFranchise & {
  franchiseName: string;
  categoryName: string;
  productName: string;
  category_franchise_id?: string;
  product_franchise_id?: string;
  is_deleted?: boolean;
};

type ApiErrorLike = {
  status?: number;
  message?: string | null;
  errors?: Array<{
    field?: string;
    message?: string;
  }>;
};

const ProductCategoryFranchisePage = () => {
  const { user } = useAuthStore();
  const role = user?.roles?.[0]?.role;
  const isAdmin = role === "ADMIN";

  const [rows, setRows] = useState<ProductCategoryFranchiseRow[]>([]);
  const [filteredRows, setFilteredRows] = useState<
    ProductCategoryFranchiseRow[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formState, setFormState] = useState<{
    isOpen: boolean;
    mode: "create" | "view" | "edit";
    item: ProductCategoryFranchiseRow | null;
  }>({ isOpen: false, mode: "create", item: null });

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "delete" | "restore";
    item: ProductCategoryFranchiseRow | null;
  }>({
    isOpen: false,
    type: "delete",
    item: null,
  });

  const {
    register,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    const nextRows = rows.filter((row) => {
      const matchesSearch =
        normalizedSearchTerm.length === 0 ||
        [row.franchiseName, row.categoryName, row.productName].some((value) =>
          String(value).toLowerCase().includes(normalizedSearchTerm),
        );

      if (!matchesSearch) {
        return false;
      }

      if (statusFilter === "all") {
        return true;
      }

      return String(row.isActive) === statusFilter;
    });

    setFilteredRows(nextRows);
  }, [rows, searchTerm, statusFilter]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const payload: ProductCategoryFranchiseSearchInput = {
        franchise_id: "",
        category_id: "",
        product_id: "",
        is_active: "",
        is_deleted: false,
        pageNum: 1,
        pageSize: 10000,
      };

      const response = await searchProductCategoryFranchisesService(payload);

      console.log("API response:", response);

      if (response?.success && response?.data) {
        const rawData = Array.isArray(response.data)
          ? response.data
          : [response.data];

        const mappedData: ProductCategoryFranchiseRow[] = (
          rawData as (ProductCategoryFranchise & Record<string, unknown>)[]
        ).map((item) => ({
          ...item,

          // map name fallback nếu API không trả
          franchiseName: (item.franchiseName ??
            item.franchise_name ??
            item.franchise_id ??
            "N/A") as string,
          categoryName: (item.categoryName ??
            item.category_name ??
            item.category_id ??
            "N/A") as string,
          productName: (item.productName ??
            item.product_name ??
            item.product_id ??
            "N/A") as string,
          category_franchise_id: (item.category_franchise_id ??
            item.categoryFranchiseId ??
            "") as string,
          product_franchise_id: (item.product_franchise_id ??
            item.productFranchiseId ??
            "") as string,

          displayOrder: (item.display_order ??
            item.displayOrder ??
            0) as number,
          isActive: (item.is_active ?? item.isActive ?? false) as boolean,
          is_deleted: (item.is_deleted ?? item.isDeleted ?? false) as boolean,
        }));

        setRows(mappedData);
        setFilteredRows(mappedData);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      setRows([]);
      setFilteredRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (
    term: string,
    filters?: Partial<Record<keyof ProductCategoryFranchiseRow, string>>,
  ) => {
    setSearchTerm(term);
    setStatusFilter(String(filters?.isActive ?? "all"));
  };

  const franchiseOptions = Array.from(
    new Set(rows.map((r) => r.franchiseName)),
  ).map((name) => ({
    label: name,
    value: name,
  }));

  const categoryOptions = Array.from(
    new Set(rows.map((r) => r.categoryName)),
  ).map((name) => ({
    label: name,
    value: name,
  }));

  const handleOpenForm = (
    mode: "create" | "edit" | "view",
    item: ProductCategoryFranchiseRow | null = null,
  ) => {
    setFormState({ isOpen: true, mode, item });
  };

  const isDuplicateMapping = (
    categoryFranchiseId: string,
    productFranchiseId: string,
  ) =>
    rows.some(
      (row) =>
        !row.is_deleted &&
        String(row.category_franchise_id ?? row.categoryFranchiseId ?? "") ===
          categoryFranchiseId &&
        String(row.product_franchise_id ?? row.productFranchiseId ?? "") ===
          productFranchiseId,
    );

  const getCreateErrorMessage = (error: unknown) => {
    const apiError = error as ApiErrorLike;
    const messages = [
      apiError.message,
      ...(apiError.errors?.map((item) => item.message) ?? []),
    ]
      .filter(Boolean)
      .map((message) => String(message).toLowerCase());

    const isDuplicateError =
      apiError.status === 409 ||
      messages.some(
        (message) =>
          message.includes("duplicate") ||
          message.includes("already exists") ||
          message.includes("đã tồn tại") ||
          message.includes("exists"),
      );

    if (isDuplicateError) {
      return "Sản phẩm này đã tồn tại trong danh mục chi nhánh đã chọn";
    }

    return (
      apiError.message ||
      apiError.errors?.[0]?.message ||
      "Thêm mới sản phẩm vào danh mục thất bại"
    );
  };

  const handleSubmitForm = async (data: ProductCategoryFranchiseFormValues) => {
    try {
      if (
        isDuplicateMapping(
          data.category_franchise_id,
          data.product_franchise_id,
        )
      ) {
        toastError("Sản phẩm này đã tồn tại trong danh mục chi nhánh đã chọn");
        return;
      }

      setIsProcessing(true);
      const res = await createProductCategoryFranchiseUsecase({
        category_franchise_id: data.category_franchise_id,
        product_franchise_id: data.product_franchise_id,
        display_order: Number(data.display_order),
      });
      if (res.success) {
        toastSuccess("Thêm mới sản phẩm vào danh mục thành công");
        setFormState((prev) => ({ ...prev, isOpen: false }));
        await fetchData();
      } else {
        toastError("Thêm mới sản phẩm vào danh mục thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi thêm:", error);
      toastError(getCreateErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = async (
    item: ProductCategoryFranchiseRow,
    newStatus: boolean,
  ) => {
    try {
      setIsProcessing(true);
      const res = await updateProductCategoryFranchiseStatusUsecase(
        String(item.id),
        newStatus,
      );
      if (res && (res.success || res.status === 200)) {
        setRows((prev) =>
          prev.map((row) =>
            String(row.id) === String(item.id)
              ? { ...row, isActive: newStatus }
              : row,
          ),
        );
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteClick = (item: ProductCategoryFranchiseRow) => {
    setModalConfig({ isOpen: true, type: "delete", item });
  };

  const handleRestoreClick = (item: ProductCategoryFranchiseRow) => {
    setModalConfig({ isOpen: true, type: "restore", item });
  };

  const handleConfirmAction = async () => {
    const { type, item } = modalConfig;
    if (!item) return;

    try {
      setIsProcessing(true);
      const res =
        type === "delete"
          ? await deleteProductCategoryFranchiseUsecase(item.id)
          : await restoreProductCategoryFranchiseUsecase(item.id);

      if (res?.success) {
        setRows((prev) =>
          prev.map((r) =>
            String(r.id) === String(item.id)
              ? { ...r, is_deleted: type === "delete" }
              : r,
          ),
        );
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      }
    } catch (error) {
      console.error("Lỗi thực hiện hành động:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryFranchiseId = (item: ProductCategoryFranchiseRow) =>
    String(item.category_franchise_id ?? item.categoryFranchiseId ?? "");

  const getGroupRows = (item: ProductCategoryFranchiseRow) =>
    rows
      .filter(
        (row) =>
          getCategoryFranchiseId(row) === getCategoryFranchiseId(item) &&
          !row.is_deleted,
      )
      .sort((first, second) => first.displayOrder - second.displayOrder);

  const canMoveItem = (
    item: ProductCategoryFranchiseRow,
    direction: "up" | "down",
  ) => {
    const groupRows = getGroupRows(item);
    const currentIndex = groupRows.findIndex(
      (row) => String(row.id) === String(item.id),
    );

    if (currentIndex < 0) return false;
    return direction === "up"
      ? currentIndex > 0
      : currentIndex < groupRows.length - 1;
  };

  const handleReorder = async (
    item: ProductCategoryFranchiseRow,
    direction: "up" | "down",
  ) => {
    const groupRows = getGroupRows(item);
    const currentIndex = groupRows.findIndex(
      (row) => String(row.id) === String(item.id),
    );

    if (currentIndex < 0) return;

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const targetItem = groupRows[targetIndex];
    if (!targetItem) return;

    const nextPosition = targetIndex + 1;

    try {
      setIsProcessing(true);

      const res = await reorderProductCategoryFranchisesService({
        category_franchise_id: getCategoryFranchiseId(item),
        item_id: String(item.id),
        new_position: nextPosition,
      });

      if (res?.success) {
        await fetchData();
        toastSuccess("Cập nhật thứ tự hiển thị thành công");
      } else {
        toastError("Cập nhật thứ tự hiển thị thất bại");
      }
    } catch (error) {
      console.error("Lỗi cập nhật thứ tự hiển thị:", error);
      toastError("Cập nhật thứ tự hiển thị thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  const columns: Column<ProductCategoryFranchiseRow>[] = [
    {
      header: "Chi nhánh",
      accessor: "franchiseName",
      className: "min-w-[180px]",
    },
    {
      header: "Danh mục",
      accessor: "categoryName",
      className: "min-w-[180px]",
    },
    {
      header: "Sản phẩm",
      accessor: "productName",
      className: "min-w-[220px]",
    },
    {
      header: "Thứ tự hiển thị",
      accessor: "displayOrder",
      className: "w-[170px]",
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 min-w-[20px]">
            {item.displayOrder}
          </span>
          {isAdmin && !item.is_deleted && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleReorder(item, "up")}
                disabled={isProcessing || !canMoveItem(item, "up")}
                className="p-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleReorder(item, "down")}
                disabled={isProcessing || !canMoveItem(item, "down")}
                className="p-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <ClientLoading />;
  }

  return (
    <>
      <CRUDPageTemplate<ProductCategoryFranchiseRow>
        title="Quản lý Menu theo chi nhánh"
        data={filteredRows}
        columns={columns}
        pageSize={10}
        statusField="isActive"
        searchKeys={["franchiseName", "categoryName", "productName"]}
        searchContent={
          <div className="flex gap-3 w-full">
            <FormSelect
              label=""
              options={franchiseOptions}
              register={register("franchise_id")}
              error={errors.franchise_id as FieldError}
              placeholder="Chọn chi nhánh"
            />

            <FormSelect
              label=""
              options={categoryOptions}
              register={register("category_id")}
              error={errors.category_id as FieldError}
              placeholder="Chọn danh mục"
            />
          </div>
        }
        filters={[
          {
            key: "isActive",
            label: "trạng thái",
            options: [
              { value: "true", label: "Đang hiển thị" },
              { value: "false", label: "Ẩn trên menu" },
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
        onStatusChange={isAdmin ? handleStatusChange : undefined}
        onDelete={isAdmin ? handleDeleteClick : undefined}
        onRestore={isAdmin ? handleRestoreClick : undefined}
        onRefresh={fetchData}
        onSearch={handleSearch}
        onAdd={isAdmin ? () => handleOpenForm("create") : undefined}
        onView={(item) => handleOpenForm("view", item)}
      />

      <ActionConfirmModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        isLoading={isProcessing}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        message={
          modalConfig.type === "delete"
            ? `Bạn có chắc muốn xóa sản phẩm "${modalConfig.item?.productName}" khỏi danh mục "${modalConfig.item?.categoryName}"?`
            : `Khôi phục sản phẩm "${modalConfig.item?.productName}" trong danh mục "${modalConfig.item?.categoryName}"?`
        }
      />

      <ProductCategoryFranchiseForm
        isOpen={formState.isOpen}
        mode={formState.mode}
        initialData={formState.item ?? undefined}
        isLoading={isProcessing}
        onClose={() => setFormState((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleSubmitForm}
      />
    </>
  );
};

export default ProductCategoryFranchisePage;
