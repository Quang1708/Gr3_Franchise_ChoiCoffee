import { useEffect, useMemo, useState } from "react";
import {
  CRUDTable,
  type Column,
} from "../../../components/Admin/template/CRUD.template";
import { toast } from "sonner";
import {
  CreateCategoryModal,
  EditCategoryModal,
  DeleteCategoryModal,
} from "../../../components/Admin/category/CategoryModals";

// ✅ RBAC
import { useAuthStore } from "@/stores/auth.store";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { can } from "@/auth/rbac";
import { PERM } from "@/auth/rbac.permissions";
import type { CategoryItem } from "./models/categoryFranchise02.model";
import { getCategoryFranchise } from "./services/categoryFranchise02.service";
import CategoryFranchiseCreateModal from "@/components/categoryFranchise/categoryFranchise.Create.Modal";


const CategoryPage = () => {
  const user = useAuthStore((s) => s.user);
  const franchiseId = useAdminContextStore((s) => s.selectedFranchiseId);

  const canWrite = useMemo(
    () => can(user, PERM.CATEGORY_WRITE, franchiseId ?? undefined),
    [user, franchiseId],
  );

  const [data, setData] = useState<CategoryItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(
    null,
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    const fetchCategoryFranchise = async () => {
      try {
        const response = await getCategoryFranchise({
          searchCondition: {
            franchise_id: franchiseId,
          },
          pageInfo: {
            pageNum: 1,
            pageSize: 5,
          },
        });
        if (response) {
          setData(response);
        }
      } catch (error) {
        console.error("Error fetching category franchise data:", error);
      }
    };
    fetchCategoryFranchise();
  }, [franchiseId]);

  const columns: Column<CategoryItem>[] = [
    {
      header: "Tên danh mục",
      accessor: "category_name",
      sortable: true,
      className: "font-semibold",
    },
    {
      header: "Ngày tạo",
      accessor: (item) => new Date(item.created_at).toLocaleDateString("vi-VN"),
      sortable: true,
    },
    {
      header: "Ngày cập nhật",
      accessor: (item) => new Date(item.updated_at).toLocaleDateString("vi-VN"),
      sortable: true,
    },
  ];

  // Create
  const handleCreateOpen = () => {
    if (!canWrite) return;
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (newData: Partial<CategoryItem>) => {
    if (!canWrite) return;
    if (!newData.category_id || !newData.category_name) return;

    // const nextId = data.length > 0 ? Math.max(...data.map((c) => c.id)) + 1 : 1;

    const category: CategoryItem = {
      category_id: newData.category_id,
      category_name: newData.category_name,
      is_active: newData.is_active ?? true,
      is_deleted: false,
      display_order: data.length + 1,
      franchise_id: franchiseId || "unknown",
      franchise_name: "unknown",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setData((prev) => [category, ...prev]);
    toast.success("Thêm danh mục thành công");
    setIsCreateOpen(false);
  };

  // Edit
  const handleEditOpen = (item: CategoryItem) => {
    if (!canWrite) return;
    setEditingCategory(item);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (updatedData: Partial<CategoryItem>) => {
    if (!canWrite || !editingCategory) return;

    setData((prev) =>
      prev.map((c) =>
        c.category_id === editingCategory.category_id
          ? {
              ...c,
              ...updatedData,
              // Check specifically for undefined to allow false
              is_active: updatedData.is_active ?? c.is_active,
              updated_at: new Date().toISOString(),
            }
          : c,
      ),
    );

    toast.success("Cập nhật danh mục thành công");
    setIsEditOpen(false);
    setEditingCategory(null);
  };

  // Delete
  const handleDeleteOpen = (item: CategoryItem) => {
    if (!canWrite) return;
    setDeletingCategory(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!canWrite || !deletingCategory) return;

    setData((prev) => prev.filter((c) => c.category_id !== deletingCategory.category_id));
    toast.success("Đã xóa danh mục thành công");
    setIsDeleteOpen(false);
    setDeletingCategory(null);
  };

  // Status
  const handleStatusChange = (item: CategoryItem, newStatus: boolean) => {
    if (!canWrite) return;

    setData((prev) =>
      prev.map((c) =>
        c.category_id === item.category_id
          ? { ...c, is_active: newStatus, updated_at: new Date().toISOString() }
          : c,
      ),
    );
    toast.success(
      `Đã cập nhật trạng thái: ${newStatus ? "Hoạt động" : "Ngưng hoạt động"}`,
    );
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)] min-h-0 flex flex-col overflow-hidden transition-all animate-fade-in">
      <CRUDTable<CategoryItem>
        title="Quản lý Danh mục"
        data={data}
        columns={columns}
        pageSize={5}
        tableMaxHeightClass="max-h-[60vh]"
        // ✅ RBAC: STAFF không thấy Add/Edit/Delete
        onAdd={canWrite ? handleCreateOpen : undefined}
        onEdit={canWrite ? handleEditOpen : undefined}
        onDelete={canWrite ? handleDeleteOpen : undefined}
        // ✅ Status vẫn hiển thị nhưng sẽ disable (nhờ CRUD.template.tsx đã sửa)
        statusField="is_active"
        onStatusChange={canWrite ? handleStatusChange : undefined}
        searchKeys={["category_name", "category_id"]}
        filters={[
          {
            key: "is_active",
            label: "Trạng thái",
            options: [
              { value: "true", label: "Hoạt động" },
              { value: "false", label: "Ngưng hoạt động" },
            ],
          },
        ]}
      />

      {/* ✅ STAFF không render modal write */}
      {canWrite ? (
        <>
          <CategoryFranchiseCreateModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSubmit={handleCreateSubmit}
          />

          <EditCategoryModal
            isOpen={isEditOpen}
            onClose={() => {
              setIsEditOpen(false);
              setEditingCategory(null);
            }}
            category={editingCategory}
            onSubmit={handleEditSubmit}
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
        </>
      ) : null}
    </div>
  );
};

export default CategoryPage;
