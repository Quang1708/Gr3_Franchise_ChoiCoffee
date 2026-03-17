import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CRUDPageTemplate,
  type Column,
} from "../../../components/Admin/template/CRUDPage.template";
import { toast } from "sonner";
import type { Category, CategorySelectItem } from "../../../models/category.model";
import ClientLoading from "@/components/Client/Client.Loading";
import {
  CreateCategoryModal,
  EditCategoryModal,
  DeleteCategoryModal,
  RestoreCategoryModal,
  ViewCategoryModal,
  type CategoryFormData,
} from "../../../components/Admin/category/CategoryModals";

// ✅ RBAC
import { useAuthStore } from "@/stores/auth.store";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { can } from "@/auth/rbac";
import { PERM } from "@/auth/rbac.permissions";
import {
  searchCategoriesUsecase,
  createCategoryUsecase,
  updateCategoryUsecase,
  deleteCategoryUsecase,
  restoreCategoryUsecase,
  getCategorySelectUsecase,
} from "./usecases";

const normalizeFilterValue = (value?: string) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return "";
};

const isMongoId = (value?: string) =>
  Boolean(value && /^[a-fA-F0-9]{24}$/.test(value));

const CategoryPage = () => {
  const user = useAuthStore((s) => s.user);
  const franchiseId = useAdminContextStore((s) => s.selectedFranchiseId);

  const canWrite = useMemo(
    () => can(user, PERM.CATEGORY_WRITE, franchiseId ?? undefined),
    [user, franchiseId],
  );

  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [parentOptions, setParentOptions] = useState<CategorySelectItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilters, setSearchFilters] = useState<
    Partial<Record<keyof Category, string>>
  >({
    is_active: "all",
    is_deleted: "false",
  });

  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [restoringCategory, setRestoringCategory] = useState<Category | null>(
    null,
  );
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);

  const columns: Column<Category>[] = [
    {
      header: "Mã danh mục",
      accessor: "code",
      sortable: true,
      className: "font-medium text-gray-900",
    },
    {
      header: "Tên danh mục",
      accessor: "name",
      sortable: true,
      className: "font-semibold",
    },
    {
      header: "Ngày tạo",
      accessor: (item) =>
        new Date(item.created_at).toLocaleDateString("vi-VN"),
      sortable: true,
    },
    {
      header: "Ngày cập nhật",
      accessor: (item) =>
        new Date(item.updated_at).toLocaleDateString("vi-VN"),
      sortable: true,
    },
  ];

  const fetchCategories = useCallback(async (
    pageNum: number,
    type: "full" | "table",
    size: number,
    keyword: string,
    filters: Partial<Record<keyof Category, string>>,
  ) => {
    try {
      if (type === "full") setIsLoading(true);
      if (type === "table") setIsTableLoading(true);

      const safeFilters = filters ?? {};
      const isActive = normalizeFilterValue(safeFilters.is_active);
      const isDeleted = normalizeFilterValue(safeFilters.is_deleted);
      const res = await searchCategoriesUsecase({
        keyword: keyword ?? "",
        is_active: isActive,
        is_deleted: isDeleted,
        pageNum,
        pageSize: size,
      });

      if (res?.success) {
        setData(res.data || []);
        setPage(res.pageInfo?.pageNum || pageNum);
        setPageSize(res.pageInfo?.pageSize || size);
        setTotalItems(res.pageInfo?.totalItems || 0);
        return;
      }

      toast.error(res?.message || "Không thể tải danh mục.");
    } catch (error) {
      console.error("Fetch categories failed:", error);
      toast.error("Không thể tải danh mục.");
    } finally {
      setIsLoading(false);
      setIsTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories(1, "full", pageSize, searchTerm, searchFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchParentOptions = useCallback(async () => {
    try {
      const res = await getCategorySelectUsecase();
      if (res?.success && Array.isArray(res.data)) {
        setParentOptions(res.data);
        return;
      }
      setParentOptions([]);
    } catch (error) {
      console.error("Fetch category select failed:", error);
      setParentOptions([]);
    }
  }, []);

  useEffect(() => {
    fetchParentOptions();
  }, [fetchParentOptions]);

  // Create
  const handleCreateOpen = () => {
    if (!canWrite) return;
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (newData: CategoryFormData) => {
    if (!canWrite) return;
    if (!newData.code || !newData.name) return;

    try {
      setIsProcessing(true);
      const parentId = newData.parent_id?.trim();
      const res = await createCategoryUsecase({
        code: newData.code,
        name: newData.name,
        description: newData.description || "",
        ...(isMongoId(parentId) ? { parent_id: parentId } : {}),
      });

      if (res?.success) {
        toast.success("Thêm danh mục thành công");
        setIsCreateOpen(false);
        await fetchCategories(page, "table", pageSize, searchTerm, searchFilters);
        return;
      }

      toast.error(res?.message || "Không thể thêm danh mục.");
    } catch (error) {
      console.error("Create category failed:", error);
      toast.error("Không thể thêm danh mục.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Edit
  const handleEditOpen = (item: Category) => {
    if (!canWrite) return;
    setEditingCategory(item);
    setIsEditOpen(true);
  };

  // View
  const handleViewOpen = (item: Category) => {
    setViewingCategory(item);
    setIsViewOpen(true);
  };

  const handleEditSubmit = async (updatedData: CategoryFormData) => {
    if (!canWrite || !editingCategory) return;

    try {
      setIsProcessing(true);
      const parentId = updatedData.parent_id?.trim();
      const res = await updateCategoryUsecase(editingCategory.id, {
        code: updatedData.code,
        name: updatedData.name,
        description: updatedData.description || "",
        ...(isMongoId(parentId) ? { parent_id: parentId } : {}),
        is_active: updatedData.is_active,
      });

      if (res?.success) {
        toast.success("Cập nhật danh mục thành công");
        setIsEditOpen(false);
        setEditingCategory(null);
        await fetchCategories(page, "table", pageSize, searchTerm, searchFilters);
        return;
      }

      toast.error(res?.message || "Không thể cập nhật danh mục.");
    } catch (error) {
      console.error("Update category failed:", error);
      toast.error("Không thể cập nhật danh mục.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete
  const handleDeleteOpen = (item: Category) => {
    if (!canWrite) return;
    setDeletingCategory(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!canWrite || !deletingCategory) return;

    try {
      setIsProcessing(true);
      const res = await deleteCategoryUsecase(deletingCategory.id);

      if (res?.success) {
        toast.success("Đã xóa danh mục thành công");
        setIsDeleteOpen(false);
        setDeletingCategory(null);
        await fetchCategories(page, "table", pageSize, searchTerm, searchFilters);
        return;
      }

      toast.error(res?.message || "Không thể xóa danh mục.");
    } catch (error) {
      console.error("Delete category failed:", error);
      toast.error("Không thể xóa danh mục.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Restore
  const handleRestoreOpen = (item: Category) => {
    if (!canWrite) return;
    setRestoringCategory(item);
    setIsRestoreOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!canWrite || !restoringCategory) return;

    try {
      setIsProcessing(true);
      const res = await restoreCategoryUsecase(restoringCategory.id);

      if (res?.success) {
        toast.success("Đã khôi phục danh mục thành công");
        setIsRestoreOpen(false);
        setRestoringCategory(null);
        await fetchCategories(page, "table", pageSize, searchTerm, searchFilters);
        return;
      }

      toast.error(res?.message || "Không thể khôi phục danh mục.");
    } catch (error) {
      console.error("Restore category failed:", error);
      toast.error("Không thể khôi phục danh mục.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Status
  const handleStatusChange = async (item: Category, newStatus: boolean) => {
    if (!canWrite) return;

    try {
      setIsProcessing(true);
      const res = await updateCategoryUsecase(item.id, {
        code: item.code,
        name: item.name,
        description: item.description || "",
        is_active: newStatus,
      });

      if (res?.success) {
        toast.success(
          `Đã cập nhật trạng thái: ${newStatus ? "Hoạt động" : "Ngưng hoạt động"}`,
        );
        await fetchCategories(page, "table", pageSize, searchTerm, searchFilters);
        return;
      }

      toast.error(res?.message || "Không thể cập nhật trạng thái.");
    } catch (error) {
      console.error("Update category status failed:", error);
      toast.error("Không thể cập nhật trạng thái.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearch = async (
    term: string,
    filters?: Partial<Record<keyof Category, string>>,
  ) => {
    const nextFilters: Partial<Record<keyof Category, string>> = {
      is_active: searchFilters.is_active ?? "all",
      is_deleted: searchFilters.is_deleted ?? "false",
      ...filters,
    };
    setSearchTerm(term);
    setSearchFilters(nextFilters);
    await fetchCategories(1, "table", pageSize, term, nextFilters);
  };

  const handleRefresh = () => {
    const resetFilters: Partial<Record<keyof Category, string>> = {
      is_active: "all",
      is_deleted: "false",
    };
    setSearchTerm("");
    setSearchFilters(resetFilters);
    fetchCategories(1, "full", pageSize, "", resetFilters);
  };

  const isDeletedView = searchFilters.is_deleted === "true";

  if (isLoading) {
    return <ClientLoading />;
  }

  return (
    <>
      {isProcessing && (
        <div className="fixed inset-0 z-[60]">
          <ClientLoading />
        </div>
      )}
      <CRUDPageTemplate<Category>
        title="Quản lý Danh mục"
        data={data}
        columns={columns}
        pageSize={pageSize}
        totalItems={totalItems}
        currentPage={page}
        onPageChange={(nextPage) =>
          fetchCategories(nextPage, "table", pageSize, searchTerm, searchFilters)
        }
        onPageSizeChange={(size) => {
          setPageSize(size);
          fetchCategories(1, "full", size, searchTerm, searchFilters);
        }}
        tableMaxHeightClass="max-h-[60vh]"
        onAdd={canWrite && !isDeletedView ? handleCreateOpen : undefined}
        onView={handleViewOpen}
        onEdit={canWrite && !isDeletedView ? handleEditOpen : undefined}
        onDelete={canWrite && !isDeletedView ? handleDeleteOpen : undefined}
        onRestore={canWrite ? handleRestoreOpen : undefined}
        statusField="is_active"
        onStatusChange={canWrite ? handleStatusChange : undefined}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        isTableLoading={isTableLoading}
        filters={[
          {
            key: "is_active",
            label: "Trạng thái",
            options: [
              { value: "true", label: "Hoạt động" },
              { value: "false", label: "Ngưng hoạt động" },
            ],
          },
          {
            key: "is_deleted",
            label: "",
            options: [
              { value: "true", label: "Đã xóa" },
              { value: "false", label: "Còn tồn tại" },
            ],
          },
        ]}
      />

      {/* ✅ STAFF không render modal write */}
      {canWrite ? (
        <>
          <CreateCategoryModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSubmit={handleCreateSubmit}
            isLoading={isProcessing}
            parentOptions={parentOptions}
          />

          <EditCategoryModal
            isOpen={isEditOpen}
            onClose={() => {
              setIsEditOpen(false);
              setEditingCategory(null);
            }}
            category={editingCategory}
            onSubmit={handleEditSubmit}
            isLoading={isProcessing}
            parentOptions={parentOptions}
          />

          <ViewCategoryModal
            isOpen={isViewOpen}
            onClose={() => {
              setIsViewOpen(false);
              setViewingCategory(null);
            }}
            category={viewingCategory}
            parentOptions={parentOptions}
          />

          <DeleteCategoryModal
            isOpen={isDeleteOpen}
            onClose={() => {
              setIsDeleteOpen(false);
              setDeletingCategory(null);
            }}
            category={deletingCategory}
            onConfirm={handleDeleteConfirm}
          />

          <RestoreCategoryModal
            isOpen={isRestoreOpen}
            onClose={() => {
              setIsRestoreOpen(false);
              setRestoringCategory(null);
            }}
            category={restoringCategory}
            onConfirm={handleRestoreConfirm}
            isLoading={isProcessing}
          />
        </>
      ) : null}
    </>
  );
};

export default CategoryPage;
