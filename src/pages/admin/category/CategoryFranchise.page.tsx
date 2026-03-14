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
  const franchiseId = useAdminContextStore((s) => s.selectedFranchiseId) || "";

  const canWrite = useMemo(
    () => can(user, PERM.CATEGORY_WRITE, franchiseId || undefined),
    [user, franchiseId],
  );
  const canChooseFranchise = useMemo(
    () => !franchiseId && can(user, PERM.CATEGORY_WRITE, undefined),
    [user, franchiseId],
  );
  const [categoryFranchiseList, setCategoryFranchiseList] = useState<CategoryItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(
    null,
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [restoringCategory, setRestoringCategory] = useState<CategoryItem | null>(
    null,
  );
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const editRef = useRef<EditCategoryFranchiseRef>(null);
  // Extract fetch function để có thể gọi lại sau khi create và phân trang
  const fetchCategoryFranchise = useCallback(async (
    pageNum = 1,
    type: "full" | "table" = "full",
    size = pageSize
  ) => {
    try {
      if (type === "full") setIsLoading(true);
      if (type === "table") setIsTableLoading(true);

      const response = await getCategoryFranchise({
        searchCondition: {
          franchise_id: franchiseId || "",
        },
        pageInfo: {
          pageNum,
          pageSize: size,
        },
      });
      

      if (response) {   
        setCategoryFranchiseList(response.data || []);
        setTotalItems(response.pageInfo?.totalItems || 0);
        setPage(response.pageInfo?.pageNum || pageNum);
        setPageSize(response.pageInfo?.pageSize || size);
      }
    } catch (error) {
      console.error("Error fetching category franchise data:", error);
      toast.error("Có lỗi xảy ra khi tải danh mục");
    } finally {
      setIsLoading(false);
      setIsTableLoading(false);
    }
  }, [franchiseId, pageSize]);
  useEffect(() => {
    fetchCategoryFranchise(1, "full");
  
  }, [fetchCategoryFranchise]);

  // Search
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSearchCategoryFranchise = async (searchTerm: string, filter: any) => {
    try{
      setIsTableLoading(true);
      const response = await getCategoryFranchise({
        searchCondition: {
          franchise_id: franchiseId || "",
          category_id: searchTerm || "",
          is_active: filter?.is_active  === "true"
            ? true
            : filter?.is_active === "false"
            ? false
            : "",
          is_deleted: filter?.is_deleted === "true"
            ? true
            : filter?.is_deleted === "false"
            ? false
            : "",
        },
        pageInfo: {
          pageNum: 1,
          pageSize: pageSize,
        },
      });
      

      if (response) {   
        setCategoryFranchiseList(response.data || []);
        setTotalItems(response.pageInfo?.totalItems || 0);
        setPage(response.pageInfo?.pageNum || 1);
        setPageSize(response.pageInfo?.pageSize || pageSize);
      }
    } catch (error) {
      console.error("Error fetching category franchise data:", error);
      toast.error("Có lỗi xảy ra khi tải danh mục");
    } finally {
      setIsLoading(false);
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryFranchise(1, "full");
  
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


  const handleRestore = (item: CategoryItem) => {
    if (!canWrite) return;
    setRestoringCategory(item);
    setIsRestoreOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!canWrite || !restoringCategory) return;

    try {
      await restoreCategoryFranchise(restoringCategory.id);
      toast.success("Đã khôi phục danh mục thành công");
      setIsRestoreOpen(false);
      setRestoringCategory(null);
      fetchCategoryFranchise(page, "table");
    } catch (error) {
      console.error("Error restoring category franchise:", error);
      toast.error("Có lỗi xảy ra khi khôi phục danh mục");
    }
  };

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

      setCategoryFranchiseList((prev) =>
        prev.filter((c) => c.category_id !== deletingCategory.category_id)
      );

      toast.success("Đã xóa danh mục thành công");
      setIsDeleteOpen(false);
      setDeletingCategory(null);
      fetchCategoryFranchise(page, "table");
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
      
      setCategoryFranchiseList((prev) =>
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
        data={categoryFranchiseList}
        columns={columns}
        pageSize={pageSize}
        totalItems={totalItems}
        currentPage={page}
        onPageChange={(nextPage) => fetchCategoryFranchise(nextPage, "table")}
        onPageSizeChange={(size) => {
          setPageSize(size);
          fetchCategoryFranchise(1, "full", size);
        }}
        tableMaxHeightClass="max-h-[60vh]"
        // ✅ RBAC: STAFF không thấy Add/Edit/Delete
        // onView={}
        onStatusChange={handleStatusChange}
        onSearch={ handleSearchCategoryFranchise}
        onAdd={canWrite ? handleCreateOpen : undefined}
        onEdit={canWrite ? handleEditOpen : undefined}
        onDelete={canWrite ? handleDeleteOpen : undefined}
        onView={canWrite ? handleViewOpen : undefined} // STAFF vẫn có thể xem chi tiết
        // ✅ Status vẫn hiển thị nhưng sẽ disable (nhờ CRUD.template.tsx đã sửa)
        statusField="is_active"
        // onStatusChange={canWrite ? handleStatusChange : undefined}
        // searchKeys={["category_name", "category_id"]}
        onRefresh={() => fetchCategoryFranchise(1, "full")}
        onRestore={canWrite ? handleRestore : undefined}
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
              { value: "false", label: "Chưa xóa" },
            ],
          },
        ]}
      />

      
      {canWrite ? (
        <>
          <CategoryFranchiseCreateModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSuccess={() => fetchCategoryFranchise(1, "full")}
            franchiseId={franchiseId}
            showFranchiseSelect={canChooseFranchise}
          />
          {/* <>
            {handleStatusChange}
          </> */}

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
                onSuccess={() => fetchCategoryFranchise(page, "table")}
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
                onSuccess={() => fetchCategoryFranchise(page, "table")}
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

          <ActionConfirmModal
            isOpen={isRestoreOpen}
            onClose={() => {
              setIsRestoreOpen(false);
              setRestoringCategory(null);
            }}
            onConfirm={handleRestoreConfirm}
            type="restore"
            title="Xác nhận khôi phục"
            message={`Bạn đang thực hiện khôi phục danh mục "${restoringCategory?.category_name}". Hành động này không thể hoàn tác.`}
          />
        </>
      ) : null}
    </>
  );
};

export default CategoryPage;
