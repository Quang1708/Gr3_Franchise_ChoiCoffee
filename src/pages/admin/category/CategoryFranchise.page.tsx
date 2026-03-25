import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { toast } from "sonner";

// ✅ RBAC
import { useAuthStore } from "@/stores/auth.store";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { can } from "@/auth/rbac";
import { PERM } from "@/auth/rbac.permissions";
import type { CategoryItem } from "./models/categoryFranchise02.model";
import { getCategoryFranchise } from "./services/categoryFranchise02.service";
import {
  CRUDPageTemplate,
  type Column,
} from "@/components/Admin/template/CRUDPage.template";
import ClientLoading from "@/components/Client/Client.Loading";
import CategoryFranchiseCreateModal from "@/components/categoryFranchise/CategoryFranchise.Modal";
import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import EditCategoryFranchise, {
  type EditCategoryFranchiseRef,
} from "@/components/categoryFranchise/EditCategoryFranchise";
import { updateStatusCategoryFranchsie } from "./services/categoryFranchise06.service";
import { restoreCategoryFranchise } from "./services/categoryFranchise05.service";
import { ActionConfirmModal } from "@/components/Admin/template/ActionConfirmModal";
import { deleteCategoryFranchise } from "./services/categoryFranchise04.service";

import { getAllFranchises } from "@/components/categoryFranchise/services/franchise08.service";
import type { FieldError } from "node_modules/react-hook-form/dist/types/errors";
import { useForm } from "react-hook-form";
import type { CategorySelectItem } from "@/models/category.model";
import { getCategorySelectUsecase } from "./usecases";
import FormSelect from "@/components/Admin/form/FormSelect";

const CategoryPage = () => {
  const user = useAuthStore((s) => s.user);
  const franchiseId = useAdminContextStore((s) => s.selectedFranchiseId) || "";
  const isAdmin = franchiseId === ""; // Nếu không chọn chi nhánh nào, tức là đang ở chế độ Admin
  const canWrite = useMemo(
    () => can(user, PERM.CATEGORY_FRANCHISE_WRITE, franchiseId || undefined),
    [user, franchiseId],
  );
  const canChooseFranchise = useMemo(
    () => !franchiseId && can(user, PERM.CATEGORY_FRANCHISE_WRITE, undefined),
    [user, franchiseId],
  );
  const [categoryFranchiseList, setCategoryFranchiseList] = useState<
    CategoryItem[]
  >([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(
    null,
  );
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
  const [restoringCategory, setRestoringCategory] =
    useState<CategoryItem | null>(null);
  const {
    register,
    watch,
    formState: { errors },
  } = useForm();
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const editRef = useRef<EditCategoryFranchiseRef>(null);
  const [franchises, setFranchises] = useState<any>();
  const franchiseIdSelected = watch("franchise_id");
  const categoryIdSelected = watch("category_id");
  const [categories, setCategories] = useState<CategorySelectItem[]>([]);
  // Extract fetch function để có thể gọi lại sau khi create và phân trang
  const fetchCategoryFranchise = useCallback(
    async (pageNum = 1, type: "full" | "table" = "full", size = pageSize) => {
      try {
        if (type === "full") setIsLoading(true);
        if (type === "table") setIsTableLoading(true);

        const response = await getCategoryFranchise({
          searchCondition: {
            franchise_id: franchiseId || franchiseIdSelected || "",
            is_deleted: false, // Mặc định chỉ lấy những mục chưa bị xóa, trừ khi filter có is_deleted
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
    },
    [franchiseId, pageSize],
  );

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategorySelectUsecase();
      if (response) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Có lỗi xảy ra khi tải danh mục");
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const loadFranchises = async () => {
      try {
        setIsLoading(true);
        const data = await getAllFranchises();
        if (data) setFranchises(data);
      } catch (error) {
        console.error("Error fetching franchises:", error);
      }
    };

    void loadFranchises();
  }, []);

  // Search
  const handleSearchCategoryFranchise = async (
    searchTerm: string,
    filter: any,
  ) => {
    try {
      setIsTableLoading(true);
      const response = await getCategoryFranchise({
        searchCondition: {
          franchise_id: franchiseId || franchiseIdSelected || "",
          category_id: searchTerm || categoryIdSelected || "",
          is_active:
            filter?.is_active === "true"
              ? true
              : filter?.is_active === "false"
                ? false
                : "",
          is_deleted:
            filter?.is_deleted === "true"
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
    item: CategoryItem,
  ) => {
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
        prev.filter((c) => c.category_id !== deletingCategory.category_id),
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

  const franchiseOptions =
    franchises?.map((f: any) => ({
      label: f.name,
      value: f.value,
    })) || [];

  const categoryOptions =
    categories?.map((f: any) => ({
      label: f.name,
      value: f.value,
    })) || [];

  if (isLoading || isTableLoading) {
    return <ClientLoading />;
  }

  // Status
  const handleStatusChange = async (item: CategoryItem, newStatus: boolean) => {
    // if (!isManager) return;

    try {
      await updateStatusCategoryFranchsie(item.id, newStatus);

      setCategoryFranchiseList((prev) =>
        prev.map((c) =>
          c.id === item.id
            ? {
                ...c,
                is_active: newStatus,
                updated_at: new Date().toISOString(),
              }
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
    <>
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
        onSearch={handleSearchCategoryFranchise}
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
        searchContent={
          <div className="flex gap-3 w-full">
            {isAdmin && (
              <FormSelect
                label=""
                key="franchise_id"
                name="chi nhánh"
                options={franchiseOptions || []}
                register={register("franchise_id")}
                error={errors.franchise_id as FieldError}
                value={franchiseIdSelected}
                placeholder="Chọn chi nhánh"
                // onChange={(val) => setSelectedFranchiseId(val)}
              />
            )}
            <FormSelect
              key="category_id"
              label=""
              name="danh mục"
              options={categoryOptions || []}
              register={register("category_id")}
              error={errors.category_id as FieldError}
              value={categoryIdSelected}
              placeholder="Chọn danh mục"
            />
          </div>
        }
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
