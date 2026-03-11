import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CRUDTable,
  type Column,
} from "../../../components/Admin/template/CRUD.template";
import { toast } from "sonner";
import type { Category } from "../../../models/category.model";
import ClientLoading from "@/components/Client/Client.Loading";
import {
  CreateCategoryModal,
  EditCategoryModal,
  DeleteCategoryModal,
  RestoreCategoryModal,
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
} from "./usecases";


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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"active" | "deleted">("active");

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

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await searchCategoriesUsecase({
        keyword: "",
        is_active: "",
        is_deleted: viewMode === "deleted" ? true : false,
        pageNum: 1,
        pageSize: 1000,
      });

      if (res?.success) {
        setData(res.data || []);
        return;
      }

      toast.error(res?.message || "Không thể tải danh mục.");
    } catch (error) {
      console.error("Fetch categories failed:", error);
      toast.error("Không thể tải danh mục.");
    } finally {
      setIsLoading(false);
    }
  }, [viewMode]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
      const res = await createCategoryUsecase({
        code: newData.code,
        name: newData.name,
        description: newData.description || "",
      });

      if (res?.success) {
        toast.success("Thêm danh mục thành công");
        setIsCreateOpen(false);
        await fetchCategories();
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

  const handleEditSubmit = async (updatedData: CategoryFormData) => {
    if (!canWrite || !editingCategory) return;

    try {
      setIsProcessing(true);
      const res = await updateCategoryUsecase(editingCategory.id, {
        code: updatedData.code,
        name: updatedData.name,
        description: updatedData.description || "",
        is_active: updatedData.is_active,
      });

      if (res?.success) {
        toast.success("Cập nhật danh mục thành công");
        setIsEditOpen(false);
        setEditingCategory(null);
        await fetchCategories();
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
        await fetchCategories();
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
        await fetchCategories();
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
      const parentId =
        item.parent_id && item.parent_id !== "undefined"
          ? item.parent_id
          : undefined;
      const res = await updateCategoryUsecase(item.id, {
        code: item.code,
        name: item.name,
        description: item.description || "",
        ...(parentId ? { parent_id: parentId } : {}),
        is_active: newStatus,
      });

      if (res?.success) {
        toast.success(
          `Đã cập nhật trạng thái: ${newStatus ? "Hoạt động" : "Ngưng hoạt động"}`,
        );
        await fetchCategories();
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

  if (isLoading) {
    return <ClientLoading />;
  }

  return (
    <div className="p-6 h-[calc(100vh-4rem)] min-h-0 flex flex-col overflow-hidden transition-all animate-fade-in">
      {isProcessing && <ClientLoading />}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setViewMode("active")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
            viewMode === "active"
              ? "bg-primary text-white border-primary"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }`}
        >
          Đang hoạt động
        </button>
        <button
          type="button"
          onClick={() => setViewMode("deleted")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
            viewMode === "deleted"
              ? "bg-red-600 text-white border-red-600"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }`}
        >
          Đã xóa
        </button>
      </div>
      <CRUDTable<Category>
        title="Quản lý Danh mục"
        data={data}
        columns={columns}
        pageSize={5}
        tableMaxHeightClass="max-h-[60vh]"
        // ✅ RBAC: STAFF không thấy Add/Edit/Delete
        onAdd={canWrite && viewMode === "active" ? handleCreateOpen : undefined}
        onEdit={canWrite && viewMode === "active" ? handleEditOpen : undefined}
        onDelete={canWrite && viewMode === "active" ? handleDeleteOpen : undefined}
        onRestore={canWrite ? handleRestoreOpen : undefined}
        showRestore={(item) => !!item.is_deleted}
        // ✅ Status vẫn hiển thị nhưng sẽ disable (nhờ CRUD.template.tsx đã sửa)
        statusField={viewMode === "active" ? "is_active" : undefined}
        onStatusChange={
          canWrite && viewMode === "active" ? handleStatusChange : undefined
        }
        searchKeys={["name", "code", "description"]}
        filters={
          viewMode === "active"
            ? [
                {
                  key: "is_active",
                  label: "Trạng thái",
                  options: [
                    { value: "true", label: "Hoạt động" },
                    { value: "false", label: "Ngưng hoạt động" },
                  ],
                },
              ]
            : []
        }
      />

      {/* ✅ STAFF không render modal write */}
      {canWrite ? (
        <>
          <CreateCategoryModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSubmit={handleCreateSubmit}
            isLoading={isProcessing}
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
    </div>
  );
};

export default CategoryPage;
