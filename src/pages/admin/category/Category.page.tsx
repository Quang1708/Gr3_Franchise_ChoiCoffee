import { useMemo, useState } from "react";
import {
  CRUDTable,
  type Column,
} from "../../../components/Admin/template/CRUD.template";
import { CATEGORIES } from "../../../mocks/dataCate.mock";
import { toast } from "sonner";
import type { Category } from "../../../models/category.model";
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

const CategoryPage = () => {
  const user = useAuthStore((s) => s.user);
  const franchiseId = useAdminContextStore((s) => s.selectedFranchiseId);

  const canWrite = useMemo(
    () => can(user, PERM.CATEGORY_WRITE, franchiseId ?? undefined),
    [user, franchiseId],
  );

  const [data, setData] = useState<Category[]>(CATEGORIES);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
      header: "Mô tả",
      accessor: "description",
      className: "truncate max-w-xs text-gray-500 italic",
    },
    {
      header: "Ngày tạo",
      accessor: (item) => new Date(item.created_at).toLocaleDateString("vi-VN"),
      sortable: true,
    },
  ];

  // Create
  const handleCreateOpen = () => {
    if (!canWrite) return;
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (newData: Partial<Category>) => {
    if (!canWrite) return;

    const category: Category = {
      id: Math.max(...data.map((c) => c.id)) + 1,
      code: newData.code!,
      name: newData.name!,
      description: newData.description || "",
      is_active: newData.is_active ?? true,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setData((prev) => [category, ...prev]);
    toast.success("Thêm danh mục thành công");
    setIsCreateOpen(false);
  };

  // Edit
  const handleEditOpen = (item: Category) => {
    if (!canWrite) return;
    setEditingCategory(item);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (updatedData: Partial<Category>) => {
    if (!canWrite || !editingCategory) return;

    setData((prev) =>
      prev.map((c) =>
        c.id === editingCategory.id
          ? { ...c, ...updatedData, updated_at: new Date().toISOString() }
          : c,
      ),
    );

    toast.success("Cập nhật danh mục thành công");
    setIsEditOpen(false);
    setEditingCategory(null);
  };

  // Delete
  const handleDeleteOpen = (item: Category) => {
    if (!canWrite) return;
    setDeletingCategory(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!canWrite || !deletingCategory) return;

    setData((prev) => prev.filter((c) => c.id !== deletingCategory.id));
    toast.success("Đã xóa danh mục thành công");
    setIsDeleteOpen(false);
    setDeletingCategory(null);
  };

  // Status
  const handleStatusChange = (item: Category, newStatus: boolean) => {
    if (!canWrite) return;

    setData((prev) =>
      prev.map((c) =>
        c.id === item.id
          ? { ...c, is_active: newStatus, updated_at: new Date().toISOString() }
          : c,
      ),
    );
    toast.success(
      `Đã cập nhật trạng thái: ${newStatus ? "Hoạt động" : "Ngưng hoạt động"}`,
    );
  };

  return (
    <div className="p-6">
      <CRUDTable<Category>
        title="Quản lý Danh mục"
        data={data}
        columns={columns}
        pageSize={5}
        // ✅ RBAC: STAFF không thấy Add/Edit/Delete
        onAdd={canWrite ? handleCreateOpen : undefined}
        onEdit={canWrite ? handleEditOpen : undefined}
        onDelete={canWrite ? handleDeleteOpen : undefined}
        // ✅ Status vẫn hiển thị nhưng sẽ disable (nhờ CRUD.template.tsx đã sửa)
        statusField="is_active"
        onStatusChange={canWrite ? handleStatusChange : undefined}
        searchKeys={["name", "code", "description"]}
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
          <CreateCategoryModal
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
