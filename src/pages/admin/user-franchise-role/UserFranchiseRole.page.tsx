import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { CRUDPageTemplate, type Column } from "@/components/Admin/template/CRUDPage.template";
import { ActionConfirmModal } from "@/components/Admin/template/ActionConfirmModal";
import ClientLoading from "@/components/Client/Client.Loading";
import { userApi } from "@/api/user";

import type { UserFranchiseRole } from "@/models/user_franchise_role.model";
import type { RequestUserFranchiseRole } from "./models/requestUserFranchiseRole.model";
import { UserFranchiseRoleForm, type UserFranchiseRoleFormValues } from "./components/UserFranchiseRoleForm";

import { searchUserFranchiseRolesUsecase } from "./usecases/searchUserFranchiseRoles.usecase";
import { createUserFranchiseRoleUsecase } from "./usecases/createUserFranchiseRole.usecase";
import { updateUserFranchiseRoleUsecase } from "./usecases/updateUserFranchiseRole.usecase";
import { deleteUserFranchiseRoleUsecase } from "./usecases/deleteUserFranchiseRole.usecase";
import { restoreUserFranchiseRoleUsecase } from "./usecases/restoreUserFranchiseRole.usecase";
import { getUserFranchiseRoleDetailUsecase } from "./usecases/getUserFranchiseRoleDetail.usecase";
import { getRoleSelectUsecase } from "./usecases/getRoleSelect.usecase";
import { getFranchiseSelectUsecase } from "./usecases/getFranchiseSelect.usecase";

type ApiUserFranchiseRole = {
  id: string;
  is_active?: boolean;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  franchise_id?: string | null;
  franchise_name?: string;
  role_id?: string;
  role_code?: string;
  role_name?: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  note?: string;
};

type SearchUserFranchiseRoleResponse = {
  data?: ApiUserFranchiseRole[];
  pageInfo?: {
    pageNum?: number;
    pageSize?: number;
    totalItems?: number;
  };
};

type MutationResponse = {
  success?: boolean;
};

type FranchiseSelectItem = {
  value: string;
  code: string;
  name: string;
};

type UserSelectApiItem = {
  id?: string | number;
  user_id?: string | number;
  name?: string;
  email?: string;
  is_deleted?: boolean;
};

type DetailUserFranchiseRoleResponse = {
  data?: ApiUserFranchiseRole;
};

type SearchUserFranchiseRoleResult =
  | SearchUserFranchiseRoleResponse
  | ApiUserFranchiseRole[]
  | null;

const resolveSearchItems = (res: SearchUserFranchiseRoleResult): ApiUserFranchiseRole[] => {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
};

const resolveSearchPageInfo = (
  res: SearchUserFranchiseRoleResult,
): SearchUserFranchiseRoleResponse["pageInfo"] => {
  if (res && !Array.isArray(res) && "pageInfo" in res) {
    return res.pageInfo;
  }
  return undefined;
};

const resolveDetailItem = (
  detail: DetailUserFranchiseRoleResponse | ApiUserFranchiseRole | null,
): ApiUserFranchiseRole | null => {
  if (!detail) return null;
  if ("data" in detail && detail.data) return detail.data;
  return detail as ApiUserFranchiseRole;
};

const isMutationSuccess = (res: MutationResponse | null): boolean => {
  // httpClient unwraps `data`, so delete API `{ success: true, data: null }` becomes `null`.
  if (res === null) return true;
  if (typeof res === "object" && "success" in res) {
    return Boolean(res.success);
  }
  return true;
};

const resolveUserSelectItems = (payload: unknown): UserSelectApiItem[] => {
  if (Array.isArray(payload)) return payload as UserSelectApiItem[];
  if (!payload || typeof payload !== "object") return [];

  const source = payload as {
    data?: unknown;
    items?: unknown;
    rows?: unknown;
  };

  if (Array.isArray(source.data)) return source.data as UserSelectApiItem[];
  if (source.data && typeof source.data === "object") {
    const nested = source.data as { items?: unknown; rows?: unknown };
    if (Array.isArray(nested.items)) return nested.items as UserSelectApiItem[];
    if (Array.isArray(nested.rows)) return nested.rows as UserSelectApiItem[];
  }
  if (Array.isArray(source.items)) return source.items as UserSelectApiItem[];
  if (Array.isArray(source.rows)) return source.rows as UserSelectApiItem[];

  return [];
};

const UserFranchiseRolePage = () => {
  const [rows, setRows] = useState<UserFranchiseRole[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchIsDeleted, setSearchIsDeleted] = useState<boolean | "">(false);
  const [searchRoleId, setSearchRoleId] = useState("");
  const [searchFranchiseId, setSearchFranchiseId] = useState("");
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("create");
  const [selectedItem, setSelectedItem] = useState<UserFranchiseRole | null>(null);
  const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);
  const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([]);
  const [franchises, setFranchises] = useState<FranchiseSelectItem[]>([]);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "delete" | "restore";
    item: UserFranchiseRole | null;
  }>({ isOpen: false, type: "delete", item: null });

  const toUserFranchiseRoleRow = (
    item: ApiUserFranchiseRole,
  ): UserFranchiseRole & { is_deleted: boolean } => {
    const rawFranchiseId = item.franchise_id;
    const normalizedFranchiseId =
      rawFranchiseId == null || String(rawFranchiseId).toLowerCase() === "null"
        ? null
        : String(rawFranchiseId);

    return {
      id: String(item.id),
      franchiseId: normalizedFranchiseId,
      roleId: String(item.role_id ?? ""),
      userId: String(item.user_id ?? ""),
      isActive: Boolean(item.is_active),
      isDeleted: Boolean(item.is_deleted),
      // CRUDPageTemplate checks soft-delete state via `is_deleted`.
      is_deleted: Boolean(item.is_deleted),
      createdAt: String(item.created_at ?? ""),
      updatedAt: String(item.updated_at ?? ""),
      roleCode: item.role_code,
      roleName: item.role_name,
      userName: item.user_name,
      userEmail: item.user_email,
      franchiseName: item.franchise_name,
      note: item.note ?? "",
    };
  };

  const fetchData = useCallback(
    async (
      pageNum = 1,
      size = pageSize,
      keyword = searchKeyword,
      isDeleted: boolean | "" = searchIsDeleted,
      roleId = searchRoleId,
      franchiseId = searchFranchiseId,
    ) => {
      try {
        setIsTableLoading(true);

        const res = (await searchUserFranchiseRolesUsecase({
          searchCondition: {
            user_id: keyword,
            is_deleted: isDeleted,
            role_id: roleId || undefined,
            franchise_id: franchiseId || undefined,
          },
          pageInfo: {
            pageNum,
            pageSize: size,
          },
        })) as SearchUserFranchiseRoleResult;

        const rawData = resolveSearchItems(res);
        const data = rawData.map(toUserFranchiseRoleRow);
        const pageInfo = resolveSearchPageInfo(res) ?? {};

        setRows(data);
        setTotalItems(pageInfo.totalItems ?? data.length);
        setPage(pageInfo.pageNum ?? pageNum);
        setPageSize(pageInfo.pageSize ?? size);
      } catch {
        toast.error("Không thể tải danh sách phân quyền");
        setRows([]);
        setTotalItems(0);
      } finally {
        setIsTableLoading(false);
      }
    },
    [pageSize, searchFranchiseId, searchIsDeleted, searchKeyword, searchRoleId],
  );

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  useEffect(() => {
    const loadUserOptions = async () => {
      try {
        const response = await userApi.search({
          keyword: "",
          pageNum: 1,
          pageSize: 10,
          is_deleted: false,
        });

        const users = resolveUserSelectItems(response)
          .filter((user) => {
            const id = user.id ?? user.user_id;
            return Boolean(id) && !user.is_deleted;
          })
          .map((user) => {
            const id = String(user.id ?? user.user_id ?? "");
            const name = String(user.name ?? "").trim();
            const email = String(user.email ?? "").trim();

            let label = id;
            if (name || email) {
              label = name || "(Không tên)";
              if (email) {
                label = `${label} - ${email}`;
              }
            }

            return { value: id, label };
          });

        setUserOptions(users);
      } catch {
        toast.error("Không thể tải danh sách người dùng");
        setUserOptions([]);
      }
    };

    loadUserOptions();
  }, []);

  useEffect(() => {
    const loadRoleOptions = async () => {
      try {
        const res = await getRoleSelectUsecase();

        if (res?.success && Array.isArray(res.data)) {
          const options = res.data
            .filter((role) => Boolean(role.value))
            .map((role) => ({
              value: String(role.value),
              label: `${role.name} (${role.code})`,
            }));

          setRoleOptions(options);
        } else {
          setRoleOptions([]);
        }
      } catch {
        toast.error("Không thể tải danh sách vai trò");
        setRoleOptions([]);
      }
    };

    loadRoleOptions();
  }, []);

  useEffect(() => {
    const loadFranchiseOptions = async () => {
      try {
        const response = await getFranchiseSelectUsecase();
        setFranchises(response ?? []);
      } catch {
        toast.error("Không thể tải danh sách chi nhánh");
        setFranchises([]);
      }
    };

    loadFranchiseOptions();
  }, []);

  const franchiseOptions = useMemo(
    () =>
      franchises
        .filter((franchise) => Boolean(franchise.value))
        .map((franchise) => ({
          value: String(franchise.value),
          label: `${franchise.name} (${franchise.code})`,
        })),
    [franchises],
  );

  const handleOpenForm = async (
    mode: "create" | "edit" | "view",
    item: UserFranchiseRole | null = null,
  ) => {
    setFormMode(mode);

    if ((mode === "edit" || mode === "view") && item) {
      try {
        const detail = (await getUserFranchiseRoleDetailUsecase(
          String(item.id),
        )) as DetailUserFranchiseRoleResponse | ApiUserFranchiseRole | null;

        const detailItem = resolveDetailItem(detail);

        if (!detailItem) {
          toast.error("Không thể tải chi tiết phân quyền");
          return;
        }

        setSelectedItem(toUserFranchiseRoleRow(detailItem));
      } catch {
        toast.error("Không thể tải chi tiết phân quyền");
        return;
      }
    } else {
      setSelectedItem(item);
    }

    setIsFormOpen(true);
  };

  const handleSubmit = async (
    data: UserFranchiseRoleFormValues,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _setError: (field: keyof UserFranchiseRoleFormValues, error: { message: string }) => void,
  ) => {
    setIsProcessing(true);
    try {
      const payload: RequestUserFranchiseRole = {
        user_id: data.user_id ?? "",
        role_id: data.role_id ?? "",
        franchise_id: data.franchise_id ?? null,
        note: data.note ?? "",
      };

      if (formMode === "create") {
        await createUserFranchiseRoleUsecase(payload);
        toast.success("Tạo phân quyền thành công");
      } else if (formMode === "edit" && selectedItem) {
        await updateUserFranchiseRoleUsecase(String(selectedItem.id), {
          role_id: data.role_id ?? "",
          note: data.note ?? "",
        });
        toast.success("Cập nhật phân quyền thành công");
      }

      await fetchData(page);
      setIsFormOpen(false);
    } catch (error: any) {
      const errData = error?.response?.data ?? error;
      const serverErrors = errData?.errors as Array<{ field?: string; message?: string }> | undefined;

      if (Array.isArray(serverErrors)) {
        serverErrors.forEach((e) => {
          if (e.message) toast.error(e.message);
        });
      } else {
        toast.error(errData?.message || "Thao tác thất bại");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAction = async () => {
    const { type, item } = modalConfig;
    if (!item) return;

    try {
      setIsProcessing(true);
      const id = String(item.id);
      const res = (
        type === "delete"
          ? await deleteUserFranchiseRoleUsecase(id)
          : await restoreUserFranchiseRoleUsecase(id)
      ) as MutationResponse | null;

      if (isMutationSuccess(res)) {
        toast.success(type === "delete" ? "Đã xóa phân quyền" : "Đã khôi phục phân quyền");
        if (type === "delete") {
          // After soft-delete, switch to deleted view so user can restore immediately.
          setSearchIsDeleted(true);
          await fetchData(1, pageSize, searchKeyword, true, searchRoleId, searchFranchiseId);
        } else {
          await fetchData(
            page,
            pageSize,
            searchKeyword,
            searchIsDeleted,
            searchRoleId,
            searchFranchiseId,
          );
        }
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      }
    } catch {
      toast.error("Thao tác thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  const columns: Column<UserFranchiseRole & { userName?: string; roleName?: string; franchiseName?: string }>[] = [
    {
      header: "Người dùng",
      accessor: "userId",
      render: (item) => <span className="font-medium text-gray-800">{item.userName ?? item.userId}</span>,
    },
    {
      header: "Vai trò",
      accessor: "roleId",
      render: (item) => item.roleName ?? item.roleId,
    },
    {
      header: "Chi nhánh",
      accessor: "franchiseId",
      render: (item) => item.franchiseName ?? item.franchiseId ?? "Hệ thống",
    },
  ];

  return (
    <>
      {isTableLoading && <ClientLoading />}
      {isProcessing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20">
          <ClientLoading />
        </div>
      )}

      <CRUDPageTemplate<UserFranchiseRole>
        title="Phân quyền người dùng"
        data={rows}
        columns={columns}
        pageSize={pageSize}
        totalItems={totalItems}
        currentPage={page}
        onPageChange={(p) =>
          fetchData(p, pageSize, searchKeyword, searchIsDeleted, searchRoleId, searchFranchiseId)
        }
        onPageSizeChange={(size) => {
          setPageSize(size);
          fetchData(1, size, searchKeyword, searchIsDeleted, searchRoleId, searchFranchiseId);
        }}
        filters={[
          {
            key: "is_deleted" as keyof UserFranchiseRole,
            label: "trạng thái xóa",
            options: [
              { value: "false", label: "Còn tồn tại" },
              { value: "true", label: "Đã xóa" },
            ],
          },
          {
            key: "role_id" as keyof UserFranchiseRole,
            label: "vai trò",
            options: roleOptions,
          },
          {
            key: "franchise_id" as keyof UserFranchiseRole,
            label: "chi nhánh",
            options: franchiseOptions,
          },
        ]}
        searchContent={<></>}
        statusField="isActive"
        onAdd={() => handleOpenForm("create")}
        onView={(item) => handleOpenForm("view", item)}
        onEdit={(item) => handleOpenForm("edit", item)}
        onDelete={(item) => setModalConfig({ isOpen: true, type: "delete", item })}
        onRestore={(item) => setModalConfig({ isOpen: true, type: "restore", item })}
        onRefresh={() => {
          setSearchKeyword("");
          setSearchIsDeleted(false);
          setSearchRoleId("");
          setSearchFranchiseId("");
          fetchData(1, pageSize, "", false, "", "");
        }}
        onSearch={async (keyword, filters) => {
          const filterMap = filters as Record<string, string | undefined> | undefined;
          let isDeleted: boolean | "" = "";
          const roleId =
            filterMap?.role_id && filterMap.role_id !== "all" ? String(filterMap.role_id) : "";
          const franchiseId =
            filterMap?.franchise_id && filterMap.franchise_id !== "all"
              ? String(filterMap.franchise_id)
              : "";

          if (filterMap?.is_deleted === "true") {
            isDeleted = true;
          } else if (filterMap?.is_deleted === "false") {
            isDeleted = false;
          }

          setSearchKeyword(keyword);
          setSearchIsDeleted(isDeleted);
          setSearchRoleId(roleId);
          setSearchFranchiseId(franchiseId);
          await fetchData(1, pageSize, keyword, isDeleted, roleId, franchiseId);
        }}
        isTableLoading={isTableLoading}
      />

      <UserFranchiseRoleForm
        isOpen={isFormOpen}
        mode={formMode}
        initialData={
          selectedItem
            ? {
                id: String(selectedItem.id),
                user_id:
                  formMode === "edit" || formMode === "view"
                    ? selectedItem.userName ?? String(selectedItem.userId)
                    : String(selectedItem.userId),
                role_id:
                  formMode === "view"
                    ? selectedItem.roleName ?? String(selectedItem.roleId)
                    : String(selectedItem.roleId),
                franchise_id:
                  formMode === "edit" || formMode === "view"
                    ? (selectedItem.franchiseName ?? selectedItem.franchiseId ?? "Hệ thống")
                    : selectedItem.franchiseId,
                note: selectedItem.note ?? "",
                user_email: selectedItem.userEmail ?? "",
                role_code: selectedItem.roleCode ?? "",
                is_active: selectedItem.isActive ? "Hoạt động" : "Ngưng hoạt động",
                is_deleted: selectedItem.isDeleted ? "Đã xóa" : "Còn tồn tại",
                created_at: selectedItem.createdAt,
                updated_at: selectedItem.updatedAt,
              }
            : undefined
        }
        isLoading={isProcessing}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        userOptions={userOptions}
        roleOptions={roleOptions}
        franchiseOptions={franchiseOptions}
      />

      <ActionConfirmModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        isLoading={isProcessing}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        message={
          modalConfig.type === "delete"
            ? "Bạn có chắc muốn xóa phân quyền này?"
            : "Khôi phục phân quyền này?"
        }
      />
    </>
  );
};

export default UserFranchiseRolePage;
