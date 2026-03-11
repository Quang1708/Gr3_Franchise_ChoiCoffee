import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  type Column,
} from "../../../components/Admin/template/CRUD.template";
import { toast } from "sonner";

// ✅ RBAC
import { useAuthStore } from "@/stores/auth.store";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { can } from "@/auth/rbac";
import { PERM } from "@/auth/rbac.permissions";
import type { CategoryItem } from "./models/categoryFranchise02.model";
import { getCategoryFranchise } from "./services/categoryFranchise02.service";
import { CRUDPageTemplate } from "@/components/Admin/template/CRUDPage.template";
import ClientLoading from "@/components/Client/Client.Loading";
import CategoryFranchiseCreateModal from "@/components/categoryFranchise/CategoryFranchise.Modal";
import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import EditCategoryFranchise, { type EditCategoryFranchiseRef } from "@/components/categoryFranchise/EditCategoryFranchise";
import { updateStatusCategoryFranchsie } from "./services/categoryFranchise06.service";
import { restoreCategoryFranchise } from "./services/categoryFranchise05.service";
import { ActionConfirmModal } from "@/components/Admin/template/ActionConfirmModal";
import { deleteCategoryFranchise } from "./services/categoryFranchise04.service";

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
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(
    null,
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const editRef = useRef<EditCategoryFranchiseRef>(null);
   // Assuming this is set during login
  // Extract fetch function để có thể gọi lại sau khi create
  const fetchCategoryFranchise = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getCategoryFranchise({
        searchCondition: {
          franchise_id : franchiseId,
        },
        pageInfo: {
          pageNum: 1,
          pageSize: 1000,
        },
      });
      if (response) {
        setData(response);
      }
    } catch (error) {
      console.error("Error fetching category franchise data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [franchiseId]);

  
  useEffect(() => {
    fetchCategoryFranchise();
  }, [fetchCategoryFranchise]);

  const columns: Column<CategoryItem>[] = [
    {
      header: "Tên danh mục",
      accessor: "category_name",
      sortable: true,
      className: "font-semibold",
    },

    {
      header: "Tên chi nhánh",
      accessor: "franchise_name",
      sortable: true,
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

  // Edit
  const handleEditOpen = (
    // mode: "create" | "edit" | "view",
    item: CategoryItem) => {
    if (!canWrite) return;
    setEditingCategory(item);
    setIsEditOpen(true);
  };


  const handleRestore = async (item: CategoryItem) => {
    if (!canWrite) return;
    try{
      await restoreCategoryFranchise(item.id);
      toast.success("Đã khôi phục danh mục thành công");
    }catch(error){
      console.error("Error restoring category franchise:", error);
      toast.error("Có lỗi xảy ra khi khôi phục danh mục");
    }  
    fetchCategoryFranchise();
  }

  // Delete
  const handleDeleteOpen = (item: CategoryItem) => {
    if (!canWrite) return;
    setDeletingCategory(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
  if (!canWrite || !deletingCategory) return;

  try {
    await deleteCategoryFranchise(deletingCategory.id);

    setData((prev) =>
      prev.filter((c) => c.category_id !== deletingCategory.category_id)
    );

    toast.success("Đã xóa danh mục thành công");
    setIsDeleteOpen(false);
    setDeletingCategory(null);
    fetchCategoryFranchise();
  } catch (error) {
    console.error("Error deleting category franchise:", error);
    toast.error("Có lỗi xảy ra khi xóa danh mục");
  }
};

  const handleViewOpen = (item: CategoryItem) => {
    setEditingCategory(item);
    setIsViewOpen(true);
  };

  if (isLoading) {
    return (
        <ClientLoading/>
    );
  }

  // Status
  const handleStatusChange = async (item: CategoryItem, newStatus: boolean) => {
    // if (!isManager) return;

    try {
      await updateStatusCategoryFranchsie(item.id, newStatus);
      
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
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  return (
    < >       
      <CRUDPageTemplate<CategoryItem>
        title="Quản lý Danh mục"
        data={data}
        columns={columns}
        pageSize={5}
        tableMaxHeightClass="max-h-[60vh]"
        // ✅ RBAC: STAFF không thấy Add/Edit/Delete
        // onView={}
        onAdd={canWrite ? handleCreateOpen : undefined}
        onEdit={canWrite ? handleEditOpen : undefined}
        onDelete={canWrite ? handleDeleteOpen : undefined}
        onView={canWrite ? handleViewOpen : undefined} // STAFF vẫn có thể xem chi tiết
        // ✅ Status vẫn hiển thị nhưng sẽ disable (nhờ CRUD.template.tsx đã sửa)
        statusField="is_active"
        onStatusChange={canWrite ? handleStatusChange : undefined}
        searchKeys={["category_name", "category_id"]}
        onRefresh={fetchCategoryFranchise}
        onRestore={canWrite ? handleRestore : undefined}
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
              { value: "false", label: "Chưa xóa" },
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
            onSuccess={fetchCategoryFranchise}
            franchiseId={franchiseId || "unknown"}
          />
          <>
            {handleStatusChange}
          </>

          <CRUDModalTemplate
            isOpen={isEditOpen}
            onClose={() => {
              setIsEditOpen(false);
              setEditingCategory(null);
            }}
            onSave={() => {
              // Trigger submit trong EditCategoryModal
              editRef.current?.submit();
            }}
            title="Danh mục"
            mode="edit"
            isLoading={false}
            maxWidth="max-w-1/2"
            children={
              <EditCategoryFranchise
                onView={false} 
                ref={editRef}
                category={editingCategory as CategoryItem}
                onClose={() => {
                  setIsEditOpen(false);
                }}
                onSuccess={fetchCategoryFranchise}
              />
            }
          />

          <CRUDModalTemplate
            isOpen={isViewOpen}
            onClose={() => {
              setIsViewOpen(false);
              setEditingCategory(null);
            }}
            onSave={() => {
              // Trigger submit trong EditCategoryModal
              editRef.current?.submit();
            }}
            title="Danh mục"
            mode="view"
            isLoading={false}
            maxWidth="max-w-1/2"
            children={
              <EditCategoryFranchise 
                onView={true}
                ref={editRef}
                category={editingCategory as CategoryItem}
                onClose={() => {
                  setIsViewOpen(false);
                }}
                onSuccess={fetchCategoryFranchise}
              />
            }
          />

          <ActionConfirmModal
            isOpen={isDeleteOpen}
            onClose={() => {
              setIsDeleteOpen(false);
              setDeletingCategory(null);
            }}
            onConfirm={handleDeleteConfirm}
            type="delete"
            title="Xác nhận xóa"
            message={`Bạn đang thực hiện xóa danh mục "${deletingCategory?.category_name}". Hành động này không thể hoàn tác.`}
          />
        </>
      ) : null}
    </>
  );
};

export default CategoryPage;
