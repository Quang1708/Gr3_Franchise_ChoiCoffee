import { useCallback, useEffect, useRef, useState } from "react";
import {
  CRUDPageTemplate,
  type Column,
} from "@/components/Admin/template/CRUDPage.template";
import { ActionConfirmModal } from "@/components/Admin/template/ActionConfirmModal";
import ClientLoading from "@/components/Client/Client.Loading";
import { Modal } from "@/components/UI/Modal";
import { useAuthStore } from "@/stores/auth.store";
import { toastError, toastSuccess } from "@/utils/toast.util";

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
  type ExistingProductCategoryMapping,
  type ProductCategoryFranchiseFormValues,
} from "./components/ProductCategoryFranchiseForm";

import type { ProductCategoryFranchiseSearchInput } from "./schema/productCategoryFranchise.schema";
import FormSelect from "@/components/Admin/Form/FormSelect";
import { useForm, type FieldError } from "react-hook-form";

type ProductCategoryFranchiseRow = ProductCategoryFranchise & {
  franchiseName: string;
  categoryName: string;
  productName: string;
  franchise_id?: string;
  category_id?: string;
  product_id?: string;
  category_franchise_id?: string;
  product_franchise_id?: string;
  is_deleted?: boolean;
};

type SearchFormValues = {
  franchise_id: string;
  category_id: string;
};

const DEFAULT_PAGE_SIZE = 20;

const DEFAULT_SEARCH_PAYLOAD: ProductCategoryFranchiseSearchInput = {
  searchCondition: {
    franchise_id: "",
    category_id: "",
    product_id: "",
    is_active: "",
    is_deleted: false,
  },
  pageInfo: {
    pageNum: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  },
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
  const roleCodes = (user?.roles ?? [])
    .map((roleItem) => String(roleItem.role ?? "").toUpperCase())
    .filter(Boolean);
  const canManageProductCategoryFranchise =
    roleCodes.includes("ADMIN") || roleCodes.includes("MANAGER");
  const canReadProductCategoryFranchise =
    canManageProductCategoryFranchise || roleCodes.includes("STAFF");

  const [rows, setRows] = useState<ProductCategoryFranchiseRow[]>([]);
  const [filterOptionRows, setFilterOptionRows] = useState<
    ProductCategoryFranchiseRow[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);
  const [existingMappings, setExistingMappings] = useState<
    ExistingProductCategoryMapping[]
  >([]);
  const [searchPayload, setSearchPayload] =
    useState<ProductCategoryFranchiseSearchInput>(DEFAULT_SEARCH_PAYLOAD);

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

  const [reorderForm, setReorderForm] = useState<{
    isOpen: boolean;
    item: ProductCategoryFranchiseRow | null;
    maxPosition: number;
    positionInput: string;
  }>({
    isOpen: false,
    item: null,
    maxPosition: 0,
    positionInput: "",
  });

  const {
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<SearchFormValues>({
    defaultValues: {
      franchise_id: "",
      category_id: "",
    },
  });

  const loadingRequestCountRef = useRef(0);

  const beginFullScreenLoading = () => {
    loadingRequestCountRef.current += 1;
    setIsLoading(true);
  };

  const endFullScreenLoading = () => {
    loadingRequestCountRef.current = Math.max(
      0,
      loadingRequestCountRef.current - 1,
    );
    if (loadingRequestCountRef.current === 0) {
      setIsLoading(false);
    }
  };

  const mapApiItemToRow = (
    item: ProductCategoryFranchise & Record<string, unknown>,
  ): ProductCategoryFranchiseRow => ({
    ...item,
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
    franchise_id: (item.franchise_id ?? item.franchiseId ?? "") as string,
    category_id: (item.category_id ?? item.categoryId ?? "") as string,
    product_id: (item.product_id ?? item.productId ?? "") as string,
    category_franchise_id: (item.category_franchise_id ??
      item.categoryFranchiseId ??
      "") as string,
    product_franchise_id: (item.product_franchise_id ??
      item.productFranchiseId ??
      "") as string,
    displayOrder: (item.display_order ?? item.displayOrder ?? 0) as number,
    isActive: (item.is_active ?? item.isActive ?? false) as boolean,
    is_deleted: (item.is_deleted ?? item.isDeleted ?? false) as boolean,
  });

  const fetchData = useCallback(
    async (
      payload: ProductCategoryFranchiseSearchInput,
      type: "full" | "table" = "table",
    ) => {
      beginFullScreenLoading();
      try {
        if (type === "table") {
          setIsTableLoading(true);
        }

        const response = await searchProductCategoryFranchisesService(payload);

        if (response?.success && response?.data) {
          const rawData = Array.isArray(response.data)
            ? response.data
            : [response.data];

          const mappedData: ProductCategoryFranchiseRow[] = (
            rawData as (ProductCategoryFranchise & Record<string, unknown>)[]
          ).map(mapApiItemToRow);

          setRows(mappedData);
          setPage(response.pageInfo?.pageNum ?? payload.pageInfo.pageNum);
          setPageSize(response.pageInfo?.pageSize ?? payload.pageInfo.pageSize);
          setTotalItems(response.pageInfo?.totalItems ?? mappedData.length);
          setSearchPayload(payload);
        } else {
          setRows([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        setRows([]);
        setTotalItems(0);
      } finally {
        setIsTableLoading(false);
        endFullScreenLoading();
      }
    },
    [],
  );

  useEffect(() => {
    fetchData(DEFAULT_SEARCH_PAYLOAD, "full");
  }, [fetchData]);

  const loadFilterOptions = useCallback(async () => {
    beginFullScreenLoading();
    try {
      const response = await searchProductCategoryFranchisesService({
        searchCondition: {
          franchise_id: "",
          category_id: "",
          product_id: "",
          is_active: "",
          is_deleted: false,
        },
        pageInfo: {
          pageNum: 1,
          pageSize: 10000,
        },
      });

      if (!response?.success || !Array.isArray(response.data)) {
        setFilterOptionRows([]);
        return;
      }

      setFilterOptionRows(
        response.data.map((item) =>
          mapApiItemToRow(
            item as ProductCategoryFranchise & Record<string, unknown>,
          ),
        ),
      );
    } catch (error) {
      console.error("Lỗi khi tải danh sách filter:", error);
      setFilterOptionRows([]);
    } finally {
      endFullScreenLoading();
    }
  }, []);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  const loadExistingMappings = useCallback(async () => {
    beginFullScreenLoading();
    try {
      const response = await searchProductCategoryFranchisesService({
        searchCondition: {
          franchise_id: "",
          category_id: "",
          product_id: "",
          is_active: "",
          is_deleted: false,
        },
        pageInfo: {
          pageNum: 1,
          pageSize: 10000,
        },
      });

      if (!response?.success || !Array.isArray(response.data)) {
        setExistingMappings([]);
        return;
      }

      const mapped = response.data.map((item) => ({
        category_franchise_id: String(
          (item as ProductCategoryFranchise & Record<string, unknown>)
            .category_franchise_id ??
            item.categoryFranchiseId ??
            "",
        ),
        product_franchise_id: String(
          (item as ProductCategoryFranchise & Record<string, unknown>)
            .product_franchise_id ??
            item.productFranchiseId ??
            "",
        ),
      }));

      setExistingMappings(mapped);
    } catch (error) {
      console.error("Lỗi khi tải mapping đã tồn tại:", error);
      setExistingMappings([]);
    } finally {
      endFullScreenLoading();
    }
  }, []);

  useEffect(() => {
    loadExistingMappings();
  }, [loadExistingMappings]);

  const handleSearch = (
    term: string,
    filters?: Partial<Record<keyof ProductCategoryFranchiseRow, string>>,
  ) => {
    const normalizedProductId = term.trim();

    const nextPayload: ProductCategoryFranchiseSearchInput = {
      searchCondition: {
        franchise_id: getValues("franchise_id") || "",
        category_id: getValues("category_id") || "",
        product_id: normalizedProductId,
        is_active:
          filters?.isActive === "true"
            ? true
            : filters?.isActive === "false"
              ? false
              : "",
        is_deleted:
          filters?.is_deleted === "true"
            ? true
            : filters?.is_deleted === "false"
              ? false
              : false,
      },
      pageInfo: {
        pageNum: 1,
        pageSize,
      },
    };

    fetchData(nextPayload, "table");
  };

  const handleRefresh = () => {
    setValue("franchise_id", "");
    setValue("category_id", "");

    const resetPayload: ProductCategoryFranchiseSearchInput = {
      searchCondition: {
        ...DEFAULT_SEARCH_PAYLOAD.searchCondition,
      },
      pageInfo: {
        pageNum: 1,
        pageSize,
      },
    };

    fetchData(resetPayload, "table");
  };

  const handlePageChange = (nextPage: number) => {
    fetchData(
      {
        ...searchPayload,
        pageInfo: {
          pageNum: nextPage,
          pageSize,
        },
      },
      "table",
    );
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    fetchData(
      {
        ...searchPayload,
        pageInfo: {
          pageNum: 1,
          pageSize: nextPageSize,
        },
      },
      "table",
    );
  };

  const franchiseOptions = [
    { label: "Tất cả chi nhánh", value: "" },
    ...Array.from(
      new Map(
        filterOptionRows
          .filter((row) => row.franchise_id)
          .map((row) => [String(row.franchise_id), row.franchiseName]),
      ).entries(),
    ).map(([value, label]) => ({
      label,
      value,
    })),
  ];

  const categoryOptions = [
    { label: "Tất cả danh mục", value: "" },
    ...Array.from(
      new Map(
        filterOptionRows
          .filter((row) => row.category_id)
          .map((row) => [String(row.category_id), row.categoryName]),
      ).entries(),
    ).map(([value, label]) => ({
      label,
      value,
    })),
  ];

  const handleOpenForm = (
    mode: "create" | "edit" | "view",
    item: ProductCategoryFranchiseRow | null = null,
  ) => {
    if (mode !== "view" && !canManageProductCategoryFranchise) {
      toastError("Bạn không có quyền thực hiện thao tác này");
      return;
    }

    if (mode === "create") {
      loadExistingMappings();
    }
    setFormState({ isOpen: true, mode, item });
  };

  const isDuplicateMapping = (
    categoryFranchiseId: string,
    productFranchiseId: string,
  ) =>
    existingMappings.some(
      (mapping) =>
        mapping.category_franchise_id === categoryFranchiseId &&
        mapping.product_franchise_id === productFranchiseId,
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
    if (!canManageProductCategoryFranchise) {
      toastError("Bạn không có quyền thực hiện thao tác này");
      return;
    }

    try {
      beginFullScreenLoading();

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

      const rawDisplayOrder = String(data.display_order ?? "").trim();
      const displayOrder = rawDisplayOrder
        ? Number.parseInt(rawDisplayOrder, 10)
        : undefined;

      if (
        displayOrder !== undefined &&
        (!Number.isFinite(displayOrder) || displayOrder < 1)
      ) {
        toastError("Thứ tự hiển thị phải là số nguyên >= 1");
        return;
      }

      const res = await createProductCategoryFranchiseUsecase({
        category_franchise_id: data.category_franchise_id,
        product_franchise_id: data.product_franchise_id,
        ...(displayOrder !== undefined ? { display_order: displayOrder } : {}),
      });
      if (res.success) {
        toastSuccess("Thêm mới sản phẩm vào danh mục thành công");
        setFormState((prev) => ({ ...prev, isOpen: false }));
        // Sau khi thêm mới, load lại toàn bộ với loading full page
        await Promise.all([
          fetchData(
            {
              ...searchPayload,
              pageInfo: { pageNum: 1, pageSize },
            },
            "full",
          ),
          loadExistingMappings(),
          loadFilterOptions(),
        ]);
      } else {
        toastError("Thêm mới sản phẩm vào danh mục thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi thêm:", error);
      toastError(getCreateErrorMessage(error));
    } finally {
      setIsProcessing(false);
      endFullScreenLoading();
    }
  };

  const handleStatusChange = async (
    item: ProductCategoryFranchiseRow,
    newStatus: boolean,
  ) => {
    if (!canManageProductCategoryFranchise) {
      toastError("Bạn không có quyền thực hiện thao tác này");
      return;
    }

    try {
      beginFullScreenLoading();
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
        toastSuccess(
          newStatus
            ? "Bật trạng thái hoạt động thành công"
            : "Tắt trạng thái hoạt động thành công",
        );
      } else {
        toastError("Cập nhật trạng thái thất bại");
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      toastError("Cập nhật trạng thái thất bại");
    } finally {
      setIsProcessing(false);
      endFullScreenLoading();
    }
  };

  const handleDeleteClick = (item: ProductCategoryFranchiseRow) => {
    if (!canManageProductCategoryFranchise) {
      toastError("Bạn không có quyền thực hiện thao tác này");
      return;
    }
    setModalConfig({ isOpen: true, type: "delete", item });
  };

  const handleRestoreClick = (item: ProductCategoryFranchiseRow) => {
    if (!canManageProductCategoryFranchise) {
      toastError("Bạn không có quyền thực hiện thao tác này");
      return;
    }
    setModalConfig({ isOpen: true, type: "restore", item });
  };

  const handleConfirmAction = async () => {
    if (!canManageProductCategoryFranchise) {
      toastError("Bạn không có quyền thực hiện thao tác này");
      return;
    }

    const { type, item } = modalConfig;
    if (!item) return;

    try {
      beginFullScreenLoading();
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
        await Promise.all([loadExistingMappings(), loadFilterOptions()]);
      }
    } catch (error) {
      console.error("Lỗi thực hiện hành động:", error);
    } finally {
      setIsProcessing(false);
      endFullScreenLoading();
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

  const applyLocalReorder = (
    itemId: string,
    categoryFranchiseId: string,
    nextPosition: number,
  ) => {
    setRows((prevRows) => {
      const groupRows = prevRows
        .filter(
          (row) =>
            getCategoryFranchiseId(row) === categoryFranchiseId &&
            !row.is_deleted,
        )
        .sort((first, second) => first.displayOrder - second.displayOrder);

      const fromIndex = groupRows.findIndex((row) => String(row.id) === itemId);
      const toIndex = Math.min(
        Math.max(nextPosition - 1, 0),
        Math.max(groupRows.length - 1, 0),
      );

      if (fromIndex < 0 || fromIndex === toIndex) {
        return prevRows;
      }

      const reorderedGroup = [...groupRows];
      const [movedRow] = reorderedGroup.splice(fromIndex, 1);
      reorderedGroup.splice(toIndex, 0, movedRow);

      const displayOrderMap = new Map<string, number>();
      reorderedGroup.forEach((row, index) => {
        displayOrderMap.set(String(row.id), index + 1);
      });

      const nextRows = prevRows.map((row) => {
        const order = displayOrderMap.get(String(row.id));
        if (!order) return row;
        return {
          ...row,
          displayOrder: order,
        };
      });

      return nextRows;
    });
  };

  const reorderToPosition = async (
    item: ProductCategoryFranchiseRow,
    nextPosition: number,
  ) => {
    if (!canManageProductCategoryFranchise) {
      toastError("Bạn không có quyền thực hiện thao tác này");
      return;
    }

    try {
      beginFullScreenLoading();
      setIsProcessing(true);

      const res = await reorderProductCategoryFranchisesService({
        category_franchise_id: getCategoryFranchiseId(item),
        item_id: String(item.id),
        new_position: nextPosition,
      });

      if (res?.success) {
        applyLocalReorder(
          String(item.id),
          getCategoryFranchiseId(item),
          nextPosition,
        );
        toastSuccess("Cập nhật thứ tự hiển thị thành công");
      } else {
        toastError("Cập nhật thứ tự hiển thị thất bại");
      }
    } catch (error) {
      console.error("Lỗi cập nhật thứ tự hiển thị:", error);
      toastError("Cập nhật thứ tự hiển thị thất bại");
    } finally {
      setIsProcessing(false);
      endFullScreenLoading();
    }
  };

  const openManualReorderForm = (item: ProductCategoryFranchiseRow) => {
    if (!canManageProductCategoryFranchise) {
      toastError("Bạn không có quyền thực hiện thao tác này");
      return;
    }

    const groupRows = getGroupRows(item);
    const maxPosition = groupRows.length;
    if (!maxPosition) return;

    setReorderForm({
      isOpen: true,
      item,
      maxPosition,
      positionInput: String(item.displayOrder),
    });
  };

  const closeManualReorderForm = () => {
    setReorderForm({
      isOpen: false,
      item: null,
      maxPosition: 0,
      positionInput: "",
    });
  };

  const submitManualReorderForm = async () => {
    if (!canManageProductCategoryFranchise) {
      toastError("Bạn không có quyền thực hiện thao tác này");
      return;
    }

    const item = reorderForm.item;
    if (!item) return;

    const maxPosition = reorderForm.maxPosition;
    if (!maxPosition) return;

    const rawValue = reorderForm.positionInput;
    const nextPosition = Number.parseInt(rawValue.trim(), 10);

    if (!Number.isInteger(nextPosition)) {
      toastError("Vị trí phải là số nguyên");
      return;
    }

    if (nextPosition < 1 || nextPosition > maxPosition) {
      toastError(`Vị trí phải nằm trong khoảng 1 đến ${maxPosition}`);
      return;
    }

    if (nextPosition === item.displayOrder) {
      closeManualReorderForm();
      return;
    }

    await reorderToPosition(item, nextPosition);
    closeManualReorderForm();
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
          {canManageProductCategoryFranchise && !item.is_deleted && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => openManualReorderForm(item)}
                disabled={isProcessing}
                className="px-2 h-6 rounded border border-gray-200 text-[11px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Thay đổi vị trí
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

  if (!canReadProductCategoryFranchise) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-sm text-gray-700">
        Bạn không có quyền truy cập chức năng này.
      </div>
    );
  }

  return (
    <>
      <CRUDPageTemplate<ProductCategoryFranchiseRow>
        title="Quản lý Menu theo chi nhánh"
        data={rows}
        columns={columns}
        pageSize={pageSize}
        totalItems={totalItems}
        currentPage={page}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        statusField="isActive"
        searchKeys={["franchiseName", "categoryName", "productName"]}
        isTableLoading={isTableLoading}
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
        onStatusChange={
          canManageProductCategoryFranchise ? handleStatusChange : undefined
        }
        onDelete={
          canManageProductCategoryFranchise ? handleDeleteClick : undefined
        }
        onRestore={
          canManageProductCategoryFranchise ? handleRestoreClick : undefined
        }
        onRefresh={handleRefresh}
        onSearch={handleSearch}
        onAdd={
          canManageProductCategoryFranchise
            ? () => handleOpenForm("create")
            : undefined
        }
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
        existingMappings={existingMappings}
        isLoading={isProcessing}
        onClose={() => setFormState((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleSubmitForm}
      />

      <Modal
        isOpen={reorderForm.isOpen}
        onClose={closeManualReorderForm}
        title="Cập nhật thứ tự hiển thị"
      >
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (isProcessing) return;
            await submitManualReorderForm();
          }}
          className="space-y-4"
        >
          <p className="text-sm text-gray-600">
            Nhập vị trí mới từ 1 đến {reorderForm.maxPosition}.
          </p>

          <input
            type="number"
            min={1}
            max={reorderForm.maxPosition || undefined}
            step={1}
            value={reorderForm.positionInput}
            onChange={(event) =>
              setReorderForm((prev) => ({
                ...prev,
                positionInput: event.target.value,
              }))
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Nhập vị trí"
            autoFocus
            disabled={isProcessing}
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeManualReorderForm}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
            >
              Xác nhận
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ProductCategoryFranchisePage;
