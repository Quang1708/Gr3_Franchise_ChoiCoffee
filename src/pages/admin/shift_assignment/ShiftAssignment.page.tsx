import { CRUDPageTemplate } from "@/components/Admin/template/CRUDPage.template";
import ClientLoading from "@/components/Client/Client.Loading";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ShiftAssignmentItem } from "./models/shiftAssignment.model";
import { toastSuccess, toastError } from "@/utils/toast.util";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { useAuthStore } from "@/stores/auth.store";
import ShiftAssignmentForm, {
  type ShiftAssignmentFormValues,
} from "./components/ShiftAssignmentForm";

// Usecases
import { searchShiftAssignment } from "./usecases/searchShiftAssignment.usecase";
import { createShiftAssignment } from "./usecases/createShiftAssignment.usecase";
import { bulkCreateShiftAssignment } from "./usecases/bulkCreateShiftAssignment.usecase";
import { updateShiftAssignmentStatus } from "./usecases/updateShiftAssignmentStatus.usecase";
import { loadLookupOptions as loadLookupOptionsUsecase } from "./usecases/loadLookupOptions.usecase";
import { getShiftAssignmentColumns } from "./shiftAssignment.columns";

const mapShiftStatusErrorMessage = (message?: string) => {
  const normalized = String(message || "").trim();

  if (!normalized) {
    return "Không thể cập nhật trạng thái phân ca";
  }

  if (normalized === "Status can only be updated from ASSIGNED") {
    return "Chỉ có thể cập nhật trạng thái khi phân ca đang ở trạng thái Đã phân công.";
  }

  if (normalized === "Status can only change to COMPLETED or ABSENT") {
    return "Từ trạng thái Đã phân công chỉ được chuyển sang Hoàn thành hoặc Vắng mặt.";
  }

  return normalized;
};

const mapShiftAssignmentSubmitErrorMessage = (message?: string) => {
  const normalized = String(message || "").trim();

  if (!normalized) {
    return "Không thể phân ca";
  }

  if (normalized === "Cannot assign shift for past dates") {
    return "Không thể phân ca cho ngày trong quá khứ.";
  }

  return normalized;
};

// ── Types ─────────────────────────────────────────────────────────────────────

type SelectOption = {
  value: string;
  label: string;
  franchiseId?: string;
};

// ── Page Component ────────────────────────────────────────────────────────────

const ShiftAssignmentPage = () => {
  const selectedFranchiseId = useAdminContextStore(
    (s) => s.selectedFranchiseId,
  );
  const user = useAuthStore((s) => s.user);
  const isAdmin = useMemo(
    () =>
      (user?.roles ?? []).some(
        (role) =>
          String(role.role ?? role.role_code ?? "").toUpperCase() === "ADMIN",
      ),
    [user?.roles],
  );
  const isManager = useMemo(
    () =>
      !isAdmin &&
      (user?.roles ?? []).some(
        (role) =>
          String(role.role ?? role.role_code ?? "").toUpperCase() === "MANAGER",
      ),
    [isAdmin, user?.roles],
  );
  const roleFranchiseIds = useMemo(
    () =>
      Array.from(
        new Set(
          (user?.roles ?? [])
            .map((role) => String(role.franchise_id ?? "").trim())
            .filter(Boolean),
        ),
      ),
    [user?.roles],
  );
  const effectiveFranchiseId = useMemo(() => {
    const selected = String(selectedFranchiseId ?? "").trim();
    if (isAdmin) return selected;
    if (selected && roleFranchiseIds.includes(selected)) return selected;
    return roleFranchiseIds[0] ?? selected;
  }, [isAdmin, roleFranchiseIds, selectedFranchiseId]);
  const isGlobalContext = isAdmin && selectedFranchiseId === null;

  const [shiftAssignments, setShiftAssignments] = useState<
    ShiftAssignmentItem[]
  >([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "view">("create");
  const [selectedShiftAssignment, setSelectedShiftAssignment] =
    useState<ShiftAssignmentItem | null>(null);
  const [isFormOpening, setIsFormOpening] = useState(false);

  // Lookup options
  const [staffOptions, setStaffOptions] = useState<SelectOption[]>([]);
  const [shiftOptions, setShiftOptions] = useState<SelectOption[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);

  const normalizeStatusFilter = (
    value: unknown,
  ): ShiftAssignmentItem["status"] | "" => {
    if (value === "all" || value == null) return "";
    return String(value) as ShiftAssignmentItem["status"];
  };

  // ── Data Fetching ─────────────────────────────────────────────────────────

  const fetchShiftAssignments = useCallback(
    async (
      pageNum = 1,
      type: "full" | "table" = "full",
      size = pageSize,
      searchFilters: any = {},
    ) => {
      try {
        if (type === "full") setIsLoading(true);
        if (type === "table") setIsTableLoading(true);

        const response = await searchShiftAssignment({
          searchCondition: {
            shift_id: searchFilters.shift_id || "",
            user_id: searchFilters.user_id || "",
            work_date: searchFilters.work_date || "",
            assigned_by: searchFilters.assigned_by || "",
            status: normalizeStatusFilter(searchFilters.status),
            is_deleted: searchFilters.is_deleted === true,
          },
          pageInfo: {
            pageNum,
            pageSize: size,
          },
        });

        setShiftAssignments(response.items);
        setPage(response.pageInfo.pageNum);
        setPageSize(response.pageInfo.pageSize);
        setTotalItems(response.pageInfo.totalItems);
      } catch (error) {
        console.error("Error fetching shift assignments:", error);
        toastError("Không thể tải danh sách phân ca");
      } finally {
        setIsLoading(false);
        setIsTableLoading(false);
      }
    },
    [pageSize],
  );

  const loadLookupOptions = useCallback(async () => {
    try {
      setLookupLoading(true);
      const options = await loadLookupOptionsUsecase({
        franchiseId: effectiveFranchiseId || selectedFranchiseId,
        allowedFranchiseIds:
          isManager && effectiveFranchiseId ? [effectiveFranchiseId] : [],
        includeFranchiseName: isAdmin && isGlobalContext,
      });
      setStaffOptions(options.staffOptions);
      setShiftOptions(options.shiftOptions);
    } catch (error) {
      console.error("Error loading lookup options:", error);
      toastError("Không thể tải danh sách nhân viên hoặc ca làm");
      setStaffOptions([]);
      setShiftOptions([]);
    } finally {
      setLookupLoading(false);
    }
  }, [
    effectiveFranchiseId,
    isAdmin,
    isGlobalContext,
    isManager,
    selectedFranchiseId,
  ]);

  useEffect(() => {
    void fetchShiftAssignments();
  }, [fetchShiftAssignments]);

  useEffect(() => {
    void loadLookupOptions();
  }, [loadLookupOptions]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleOpenForm = (
    mode: "create" | "view",
    shiftAssignment: ShiftAssignmentItem | null = null,
  ) => {
    setFormMode(mode);
    setSelectedShiftAssignment(shiftAssignment);
    setIsFormOpen(true);
    setIsFormOpening(true);
    void loadLookupOptions().finally(() => {
      setIsFormOpening(false);
    });
  };

  const handleSubmitShiftAssignment = async (
    data: ShiftAssignmentFormValues,
    setError: any,
  ) => {
    try {
      setIsProcessing(true);

      if (formMode === "create") {
        const selectedShiftIds = Array.from(
          new Set(
            (data.shift_ids ?? [])
              .map((id) => String(id || "").trim())
              .filter(Boolean),
          ),
        );

        if (selectedShiftIds.length > 1) {
          await bulkCreateShiftAssignment(
            selectedShiftIds.map((shiftId) => ({
              user_id: data.user_id,
              shift_id: shiftId,
              work_date: data.work_date,
              note: data.note,
            })),
          );
        } else {
          const shiftId =
            selectedShiftIds[0] || String(data.shift_id || "").trim();
          if (!shiftId) {
            setError("shift_id", {
              type: "manual",
              message: "Ca làm là bắt buộc",
            });
            return;
          }

          await createShiftAssignment({
            user_id: data.user_id,
            shift_id: shiftId,
            work_date: data.work_date,
            note: data.note,
          });
        }
        toastSuccess("Phân ca thành công!");
      }

      await fetchShiftAssignments(page, "table", pageSize);
      setIsFormOpen(false);
      setSelectedShiftAssignment(null);
    } catch (error: any) {
      console.error("Error submitting shift assignment:", error);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;

        if (Array.isArray(errors)) {
          errors.forEach((err: { field: string; message: string }) => {
            setError(err.field, {
              type: "manual",
              message: err.message,
            });
          });
        } else {
          Object.keys(errors).forEach((field) => {
            setError(field, {
              type: "manual",
              message: errors[field],
            });
          });
        }
      } else {
        const apiMessage = error.response?.data?.message;
        const displayMessage = mapShiftAssignmentSubmitErrorMessage(apiMessage);
        toastError(displayMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangeStatus = useCallback(
    async (
      item: ShiftAssignmentItem,
      newStatus: ShiftAssignmentItem["status"],
    ) => {
      try {
        setIsProcessing(true);
        await updateShiftAssignmentStatus(item.id, newStatus);
        setShiftAssignments((prev) =>
          prev.map((sa) =>
            sa.id === item.id ? { ...sa, status: newStatus } : sa,
          ),
        );
        toastSuccess("Cập nhật trạng thái phân ca thành công!");
        await fetchShiftAssignments(page, "table", pageSize);
      } catch (error) {
        const err = error as {
          response?: {
            data?: {
              message?: string;
            };
          };
          message?: string;
        };
        const apiMessage = err.response?.data?.message || err.message;
        const displayMessage = mapShiftStatusErrorMessage(apiMessage);
        console.error("Error changing shift assignment status:", error);
        toastError(displayMessage);
      } finally {
        setIsProcessing(false);
      }
    },
    [fetchShiftAssignments, page, pageSize],
  );

  const columns = useMemo(
    () =>
      getShiftAssignmentColumns({
        isProcessing,
        isTableLoading,
        onChangeStatus: (item, newStatus) => {
          void handleChangeStatus(item, newStatus);
        },
      }),
    [handleChangeStatus, isProcessing, isTableLoading],
  );

  const handleSearch = async (keyword: string, filters: any) => {
    try {
      setIsProcessing(true);

      await fetchShiftAssignments(1, "table", pageSize, {
        ...filters,
        keyword,
      });
    } catch (error) {
      console.error("Error searching shift assignments:", error);
      toastError("Lỗi khi tìm kiếm");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {isLoading && <ClientLoading />}

      <CRUDPageTemplate<ShiftAssignmentItem>
        title="Phân ca làm việc"
        columns={columns}
        data={shiftAssignments}
        pageSize={pageSize}
        totalItems={totalItems}
        currentPage={page}
        onView={(item) => {
          void handleOpenForm("view", item);
        }}
        onAdd={() => {
          void handleOpenForm("create");
        }}
        onRefresh={() => fetchShiftAssignments(1, "full")}
        onPageChange={(newPage) => fetchShiftAssignments(newPage, "table")}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          fetchShiftAssignments(1, "table", newSize);
        }}
        onSearch={handleSearch}
        filters={[
          {
            key: "status",
            label: "Trạng thái",
            options: [
              { label: "Đã phân công", value: "ASSIGNED" },
              { label: "Hoàn thành", value: "COMPLETED" },
              { label: "Đã hủy", value: "CANCELED" },
              { label: "Vắng mặt", value: "ABSENT" },
            ],
          },
        ]}
        isTableLoading={isProcessing || isTableLoading}
      />

      <ShiftAssignmentForm
        isOpen={isFormOpen}
        mode={formMode}
        initialData={selectedShiftAssignment || undefined}
        isLoading={isProcessing || isFormOpening}
        onClose={() => setIsFormOpen(false)}
        onSubmit={(data, setError) => {
          void handleSubmitShiftAssignment(data, setError);
        }}
        staffOptions={staffOptions}
        shiftOptions={shiftOptions}
        lookupLoading={lookupLoading}
      />
    </>
  );
};

export default ShiftAssignmentPage;
