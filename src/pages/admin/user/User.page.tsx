import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAdminContextStore } from "@/stores";

import {
  CRUDPageTemplate,
  type Column,
} from "@/components/Admin/template/CRUDPage.template";
import { ActionConfirmModal } from "@/components/Admin/template/ActionConfirmModal";
import ClientLoading from "@/components/Client/Client.Loading";

import type { User } from "@/models/user.model";
import type { RequestUser } from "./models/requestUser.model";
import { UserForm, type UserFormValues } from "./components/UserForm";

import { searchUsersUsecase } from "./usecases/searchUsers.usecase";
import { updateUserStatusUsecase } from "./usecases/updateUserStatus.usecase";
import { deleteUserUsecase } from "./usecases/deleteUser.usecase";
import { restoreUserUsecase } from "./usecases/restoreUserUsecase";
import { createUserUsecase } from "./usecases/createUser.usecase";
import { updateUserUsecase } from "./usecases/updateUser.usecase";
import { getUserDetailUsecase } from "./usecases/getUserDetail.usecase";
import { getUserRolesByUserIdUsecase } from "../user-franchise-role/usecases/getUserRolesByUserId.usecase";
import UserFranchiseRolePage from "../user-franchise-role/UserFranchiseRole.page";
import { can } from "@/auth/rbac";
import { PERM } from "@/auth/rbac.permissions";
import { useAuthStore } from "@/stores/auth.store"; // hoặc store user của bạn

const DEFAULT_AVATAR =
  "https://i.pinimg.com/736x/af/80/37/af80374611f4673d1928a881727e13b0.jpg";

type UserFranchiseRoleItem = {
  role_name?: string;
  role_code?: string;
  role_display_name?: string;
  franchise_name?: string;
  franchise_id?: string | number | null;
  franchiseId?: string | number | null;
  franchise?: {
    name?: string;
  } | null;
  role?: {
    role_name?: string;
    role_code?: string;
    role_display_name?: string;
  } | null;
};

type UserWithRoleDetails = User & {
  roleDetailsText?: string;
};

const resolveUserFranchiseRoleItems = (
  payload: unknown,
): UserFranchiseRoleItem[] => {
  if (Array.isArray(payload)) return payload as UserFranchiseRoleItem[];
  if (!payload || typeof payload !== "object") return [];

  const source = payload as {
    data?: unknown;
    items?: unknown;
    rows?: unknown;
  };

  if (Array.isArray(source.data)) return source.data as UserFranchiseRoleItem[];
  if (source.data && typeof source.data === "object") {
    const nested = source.data as { items?: unknown; rows?: unknown };
    if (Array.isArray(nested.items))
      return nested.items as UserFranchiseRoleItem[];
    if (Array.isArray(nested.rows))
      return nested.rows as UserFranchiseRoleItem[];
  }
  if (Array.isArray(source.items))
    return source.items as UserFranchiseRoleItem[];
  if (Array.isArray(source.rows)) return source.rows as UserFranchiseRoleItem[];

  return [];
};

const getTabButtonClass = (isActive: boolean) =>
  `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
    isActive
      ? "bg-white border border-b-0 border-gray-200 text-primary -mb-px"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
  }`;

const UserPage = () => {
  const selectedFranchiseId = useAdminContextStore(
    (state) => state.selectedFranchiseId,
  );
  const isAdmin = selectedFranchiseId === null;

  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const user = useAuthStore((s) => s.user);

  const canManageUser = can(user, PERM.USER_MANAGE, selectedFranchiseId);
  // Modal xác nhận (Xóa/Khôi phục)
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "delete" | "restore";
    user: User | null;
  }>({ isOpen: false, type: "delete", user: null });

  // Modal Form (Thêm/Sửa/Xem)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [selectedUser, setSelectedUser] = useState<UserWithRoleDetails | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"users" | "userFranchiseRoles">(
    "users",
  );

  // Helper function to map API response to User with proper property names
  const toUserRow = (item: any): User => {
    return {
      id: item.id,
      email: item.email,
      name: item.name,
      phone: item.phone,
      avatar_url: item.avatar_url,
      roleCode: item.roleCode || item.role_code || "",
      is_active: item.is_active,
      is_deleted: item.is_deleted,
      created_at: item.created_at,
      updated_at: item.updated_at,
      is_verified: item.is_verified, // Assuming API might return this field
    } as User;
  };

  // Hàm Fetch ban đầu
  const fetchUsers = useCallback(
    async (pageNum = 1, size?: number) => {
      try {
        setIsTableLoading(true);

        const searchPayload = {
          searchCondition: {
            keyword: "",
            is_active: "",
            is_deleted: "false",
          },
          pageInfo: {
            pageNum,
            pageSize: size || pageSize,
          },
        };

        const res = await searchUsersUsecase(searchPayload);

        if (res && typeof res === "object") {
          const userList = res.data || [];
          const paginationInfo = res.pageInfo || {};

          if (Array.isArray(userList)) {
            setUsers(userList.map(toUserRow));
            setTotalItems(paginationInfo.totalItems || userList.length);
            setPage(paginationInfo.pageNum || pageNum);
            if (paginationInfo.pageSize) {
              setPageSize(paginationInfo.pageSize);
            }
          } else {
            setUsers([]);
          }
        } else {
          setUsers([]);
        }
      } catch {
        toast.error("Không thể tải danh sách người dùng");
        setUsers([]);
      } finally {
        setIsTableLoading(false);
      }
    },
    [pageSize],
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);
  useEffect(() => {
    if (!canManageUser && activeTab === "userFranchiseRoles") {
      setActiveTab("users");
    }
  }, [canManageUser, activeTab]);

  const handleSearchUsers = async (
    keyword: string,
    filters?: Record<string, string>,
  ) => {
    try {
      setIsLoading(true);

      let isActive: boolean | string = "";
      if (filters?.is_active === "true") {
        isActive = true;
      } else if (filters?.is_active === "false") {
        isActive = false;
      }

      let isDeleted: boolean | string = "";
      if (filters?.is_deleted === "true") {
        isDeleted = true;
      } else if (filters?.is_deleted === "false") {
        isDeleted = false;
      }

      const searchPayload = {
        searchCondition: {
          keyword,
          is_active: isActive,
          is_deleted: isDeleted,
        },
        pageInfo: {
          pageNum: 1,
          pageSize: pageSize,
        },
      };

      const res = await searchUsersUsecase(searchPayload);

      if (res && typeof res === "object") {
        const userList = res.data || [];
        const paginationInfo = res.pageInfo || {};

        if (Array.isArray(userList) && userList.length > 0) {
          setUsers(userList.map(toUserRow));
          setTotalItems(paginationInfo.totalItems || userList.length);
          setPage(1);
        } else {
          setUsers([]);
          setTotalItems(0);
          setPage(1);
          toast.error("Không tìm thấy người dùng");
        }
      } else {
        setUsers([]);
      }
    } catch {
      toast.error("Lỗi khi tìm kiếm");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý mở Modal Form
  const handleOpenForm = async (
    mode: "create" | "edit" | "view",
    user: User | null = null,
  ) => {
    setFormMode(mode);
    if (mode === "view" && user) {
      try {
        const detail = await getUserDetailUsecase(user.id);
        const userDetail = toUserRow(detail.data);
        const userRolesRes = await getUserRolesByUserIdUsecase(String(user.id));
        const roleItems = resolveUserFranchiseRoleItems(userRolesRes);
        const roleDetailsText = roleItems.length
          ? roleItems
              .map((item) => {
                const role =
                  item.role_display_name ||
                  item.role_name ||
                  item.role?.role_display_name ||
                  item.role?.role_name ||
                  item.role_code ||
                  item.role?.role_code ||
                  "Không rõ vai trò";

                const rawFranchiseId = item.franchise_id ?? item.franchiseId;
                const franchiseFromId =
                  rawFranchiseId === null || rawFranchiseId === undefined
                    ? ""
                    : `Franchise ${rawFranchiseId}`;

                const franchise =
                  item.franchise_name ||
                  item.franchise?.name ||
                  franchiseFromId ||
                  "Hệ thống";

                return `${role} (${franchise})`;
              })
              .join(", ")
          : undefined;

        setSelectedUser({
          ...userDetail,
          roleDetailsText,
        });
      } catch {
        toast.error("Không thể tải chi tiết người dùng");
        return;
      }
    } else {
      setSelectedUser(user as UserWithRoleDetails | null);
    }
    setIsFormOpen(true);
  };

  // Xử lý Submit Form (Create/Edit)
  const handleSubmitUser = async (
    data: UserFormValues,
    setError: (field: keyof UserFormValues, error: { message: string }) => void,
  ) => {
    setIsProcessing(true);
    try {
      if (formMode === "create") {
        const createPayload: RequestUser = {
          email: data.email,
          password: data.password || "",
          phone: data.phone,
          name: data.name,
          avatar_url: data.avatar_url?.trim()
            ? data.avatar_url
            : DEFAULT_AVATAR,
        };

        await createUserUsecase(createPayload);
        toast.success("Thêm người dùng thành công!");
      } else if (formMode === "edit" && selectedUser) {
        const updatePayload: RequestUser = {
          email: data.email,
          phone: data.phone,
          name: data.name,
          roleCode: data.roleCode,
          avatar_url: data.avatar_url?.trim()
            ? data.avatar_url
            : DEFAULT_AVATAR,
        };
        await updateUserUsecase(selectedUser.id, updatePayload);
        toast.success("Cập nhật người dùng thành công!");
      }

      await fetchUsers(page);
      setIsFormOpen(false);
    } catch (error: unknown) {
      const errData = (error as Record<string, any>)?.response?.data || error;
      const serverErrors = (errData as Record<string, any>)?.errors as
        | Array<Record<string, any>>
        | undefined;

      if (Array.isArray(serverErrors)) {
        serverErrors.forEach((e: Record<string, any>) => {
          setError(e.field as keyof UserFormValues, {
            message: e.message as string,
          });
          toast.error(e.message as string);
        });
      } else {
        toast.error(
          (errData as Record<string, any>)?.message || "Thao tác thất bại!",
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý đổi trạng thái nhanh (Active/Inactive)
  const handleStatusChange = async (user: User, newStatus: boolean) => {
    try {
      const res = await updateUserStatusUsecase(user.id, newStatus);
      if (res?.success || res?.status === 200) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, is_active: newStatus } : u,
          ),
        );
        toast.success("Cập nhật trạng thái thành công");
      }
    } catch {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  // Xử lý Xóa/Khôi phục qua Modal xác nhận
  const handleConfirmAction = async () => {
    const { type, user } = modalConfig;
    if (!user) return;

    try {
      setIsProcessing(true);
      const res =
        type === "delete"
          ? await deleteUserUsecase(user.id)
          : await restoreUserUsecase(user.id);

      if (res?.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, is_deleted: type === "delete" } : u,
          ),
        );
        toast.success(
          type === "delete" ? "Đã xóa người dùng" : "Đã khôi phục người dùng",
        );
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      }
    } catch {
      toast.error("Thao tác thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete
  const handleDeleteClick = (user: User) => {
    setModalConfig({ isOpen: true, type: "delete", user });
  };

  // Restore
  const handleRestoreClick = (user: User) => {
    setModalConfig({ isOpen: true, type: "restore", user });
  };

  // TABLE COLUMNS
  const columns: Column<User>[] = [
    {
      header: "Người dùng",
      accessor: "name",
      className: "min-w-[250px] md:min-w-[350px]",
      render: (item) => (
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={item.avatar_url || DEFAULT_AVATAR}
            alt={item.name}
            className="w-10 h-10 rounded-full object-cover border border-black/10 flex-shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-gray-800 truncate">
              {item.name}
            </span>
            <span className="text-sm text-gray-500 truncate">{item.email}</span>
          </div>
        </div>
      ),
      sortable: true,
    },
    { header: "Số điện thoại", accessor: "phone" },
    {
      header: "Verified",
      accessor: "is_verified",
      render: (item) => (
        <span
          className={`px-2 py-1 text-[10px] rounded-xl ${
            item.is_verified
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {item.is_verified ? "Đã xác thực" : "Chưa xác thực"}
        </span>
      ),
    },
  ];

  const shouldShowUsersTab = activeTab === "users" || !canManageUser;

  return (
    <div className="p-6 transition-all animate-fade-in h-full min-h-0 overflow-hidden flex flex-col">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Quản lý người dùng
      </h1>

      <div className="flex gap-2 mb-6 border-b border-gray-200 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={getTabButtonClass(activeTab === "users")}
        >
          Người dùng
        </button>
        {canManageUser && (
          <button
            type="button"
            onClick={() => setActiveTab("userFranchiseRoles")}
            className={getTabButtonClass(activeTab === "userFranchiseRoles")}
          >
            User Franchise Role
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {shouldShowUsersTab && (
          <div className="h-full min-h-0 flex flex-col">
            {(isLoading || isTableLoading) && <ClientLoading />}
            {isProcessing && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20">
                <ClientLoading />
              </div>
            )}

          <CRUDPageTemplate<User>
            title="Danh sách người dùng"
            data={users}
            columns={columns}
            tableMaxHeightClass="flex-1 overflow-auto"
            pageSize={pageSize}
            totalItems={totalItems}
            currentPage={page}
            onPageChange={(page) => fetchUsers(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              fetchUsers(1, size);
            }}
            statusField="is_active"
            onStatusChange={isAdmin ? handleStatusChange : undefined}
            filters={[
              {
                key: "is_active",
                label: "trạng thái",
                options: [
                  { value: "true", label: "Hoạt động" },
                  { value: "false", label: "Ngưng hoạt động" },
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
            onAdd={canManageUser ? () => handleOpenForm("create") : undefined}
            onView={(item) => handleOpenForm("view", item)}
            onEdit={
              canManageUser ? (item) => handleOpenForm("edit", item) : undefined
            }
            onDelete={isAdmin ? handleDeleteClick : undefined}
            onRestore={isAdmin ? handleRestoreClick : undefined}
            onRefresh={() => fetchUsers(1)}
            onSearch={handleSearchUsers}
            isTableLoading={isTableLoading}
          />

          <UserForm
            isOpen={isFormOpen}
            mode={formMode}
            initialData={selectedUser ?? undefined}
            isLoading={isProcessing}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleSubmitUser}
            setIsLoadingGlobal={setIsProcessing}
          />

          <ActionConfirmModal
            isOpen={modalConfig.isOpen}
            type={modalConfig.type}
            isLoading={isProcessing}
            onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
            onConfirm={handleConfirmAction}
            message={
              modalConfig.type === "delete"
                ? `Bạn có chắc muốn xóa "${modalConfig.user?.name}"?`
                : `Khôi phục tài khoản cho "${modalConfig.user?.name}"?`
            }
          />
          </div>
        )}

        {!shouldShowUsersTab && canManageUser && (
          <div className="h-full min-h-0 rounded-lg border border-gray-100 bg-white p-2 overflow-hidden">
            <UserFranchiseRolePage />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPage;
