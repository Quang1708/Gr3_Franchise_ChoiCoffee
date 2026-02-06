import { useState } from "react";
import {
  CRUDTable,
  type Column,
} from "../../../components/Admin/template/CRUD.template";

import { toast } from "sonner";
import type { Category } from "../../../models/category.model";
import {
  CreateCategoryModal,
  EditCategoryModal,
  DeleteCategoryModal,
  type CategoryFormData,
} from "../../../components/Admin/category/CategoryModals";
import { CATEGORY_SEED_DATA } from "@/mocks/category.seed";

const CategoryPage = () => {
  const [data, setData] = useState<Category[]>(CATEGORY_SEED_DATA);
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
      header: "Ngày tạo",
      accessor: (item) => new Date(item.createdAt).toLocaleDateString("vi-VN"),
      sortable: true,
    },
    {
      header: "Ngày cập nhật",
      accessor: (item) => new Date(item.updatedAt).toLocaleDateString("vi-VN"),
      sortable: true,
    },
  ];

  // Create
  const handleCreateOpen = () => setIsCreateOpen(true);

  const handleCreateSubmit = (newData: CategoryFormData) => {
    // Determine the next ID
    const nextId = data.length > 0 ? Math.max(...data.map((c) => c.id)) + 1 : 1;

    const category: Category = {
      id: nextId,
      code: newData.code,
      name: newData.name,
      description: newData.description || "",
      // Map form's is_active to model's isActive
      isActive: newData.is_active ?? true,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setData((prev) => [category, ...prev]);
    toast.success("Thêm danh mục thành công");
    setIsCreateOpen(false);
  };

  // Edit
  const handleEditOpen = (item: Category) => {
    setEditingCategory(item);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (updatedData: Partial<CategoryFormData>) => {
    if (!editingCategory) return;

    setData((prev) =>
      prev.map((c) =>
        c.id === editingCategory.id
          ? {
              ...c,
              ...updatedData,
              // Check specifically for undefined to allow false
              isActive: updatedData.is_active ?? c.isActive,
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    );

    toast.success("Cập nhật danh mục thành công");
    setIsEditOpen(false);
    setEditingCategory(null);
  };

  // Delete
  const handleDeleteOpen = (item: Category) => {
    setDeletingCategory(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingCategory) return;

    setData((prev) => prev.filter((c) => c.id !== deletingCategory.id));
    toast.success("Đã xóa danh mục thành công");
    setIsDeleteOpen(false);
    setDeletingCategory(null);
  };

  // Status
  const handleStatusChange = (item: Category, newStatus: boolean) => {
    setData((prev) =>
      prev.map((c) =>
        c.id === item.id
          ? { ...c, isActive: newStatus, updatedAt: new Date().toISOString() }
          : c,
      ),
    );
    toast.success(
      `Đã cập nhật trạng thái: ${newStatus ? "Hoạt động" : "Ngưng hoạt động"}`,
    );
  };

  return (
    <div className="p-6 h-auto max-h-[calc(100vh-4rem)] flex flex-col">
      <CRUDTable<Category>
        title="Quản lý Danh mục"
        data={data}
        columns={columns}
        pageSize={5}
        onAdd={handleCreateOpen}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
        statusField="isActive"
        onStatusChange={handleStatusChange}
        searchKeys={["name", "code", "description"]}
        filters={[
          {
            key: "isActive",
            label: "Trạng thái",
            options: [
              { value: "true", label: "Hoạt động" },
              { value: "false", label: "Ngưng hoạt động" },
            ],
          },
        ]}
      />

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
    </div>
  );
};

export default CategoryPage;
