import {
  CRUDPageTemplate,
  type Column,
} from "@/components/Admin/template/CRUDPage.template";
import ClientLoading from "@/components/Client/Client.Loading";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ShiftAssignmentItem } from "./models/shiftAssignment.model";
import { toastSuccess, toastError } from "@/utils/toast.util";
import { useAdminContextStore } from "@/stores/adminContext.store";
import ShiftAssignmentForm, {
  type ShiftAssignmentFormValues,
} from "@/components/Admin/shift_assignment/ShiftAssignmentForm";

// Usecases
import { searchShiftAssignment } from "./usecases/searchShiftAssignment.usecase";
import { createShiftAssignment } from "./usecases/createShiftAssignment.usecase";
import { updateShiftAssignmentStatus } from "./usecases/updateShiftAssignmentStatus.usecase";
import { loadLookupOptions as loadLookupOptionsUsecase } from "./usecases/loadLookupOptions.usecase";
import { statusBadge } from "./shiftAssignment.utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type SelectOption = {
  value: string;
  label: string;
};

// ── Page Component ────────────────────────────────────────────────────────────

const ShiftAssignmentPage = () => {
  const selectedFranchiseId = useAdminContextStore(
    (s) => s.selectedFranchiseId,
  );

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
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [selectedShiftAssignment, setSelectedShiftAssignment] =
    useState<ShiftAssignmentItem | null>(null);

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

  const mapToggleToStatus = (
    item: ShiftAssignmentItem,
    isEnabled: boolean,
  ): ShiftAssignmentItem["status"] => {
    if (!isEnabled) return "CANCELED";
    return item.status === "CANCELED" ? "ASSIGNED" : item.status;
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
      const options = await loadLookupOptionsUsecase(selectedFranchiseId);
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
  }, [selectedFranchiseId]);

  useEffect(() => {
    void fetchShiftAssignments();
  }, [fetchShiftAssignments]);

  useEffect(() => {
    void loadLookupOptions();
  }, [loadLookupOptions]);

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns: Column<ShiftAssignmentItem>[] = useMemo(
    () => [
      {
        header: "Nhân viên",
        accessor: "user_id",
        sortable: true,
        render: (item) => (
          <span className="font-medium text-gray-800">
            {item.user_name ?? item.user_id}
          </span>
        ),
      },
      {
        header: "Ca làm",
        accessor: "shift_id",
        sortable: true,
        render: (item) =>
          item.start_time && item.end_time ? (
            <span className="text-sm text-gray-700">
              {item.start_time} – {item.end_time}
            </span>
          ) : (
            <span className="text-sm text-gray-500">{item.shift_id}</span>
          ),
      },
      {
        header: "Ngày làm",
        accessor: "work_date",
        sortable: true,
      },
      {
        header: "Trạng thái",
        accessor: "status",
        render: (item) => (
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusBadge(item.status)}`}
          >
            {item.status}
          </span>
        ),
      },
      {
        header: "Người phân ca",
        accessor: "assigned_by",
        render: (item) => item.assigned_by_name ?? item.assigned_by ?? "--",
      },
    ],
    [],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleOpenForm = (
    mode: "create" | "edit" | "view",
    shiftAssignment: ShiftAssignmentItem | null = null,
  ) => {
    setFormMode(mode);
    setSelectedShiftAssignment(shiftAssignment);
    setIsFormOpen(true);
  };

  const handleSubmitShiftAssignment = async (
    data: ShiftAssignmentFormValues,
    setError: any,
  ) => {
    try {
      setIsProcessing(true);

      if (formMode === "create") {
        await createShiftAssignment({
          user_id: data.user_id,
          shift_id: data.shift_id,
          work_date: data.work_date,
          note: data.note,
        });
        toastSuccess("Phân ca thành công!");
      } else if (formMode === "edit" && selectedShiftAssignment) {
        // Note: You may want to create an update usecase if needed
        toastSuccess("Cập nhật phân ca thành công!");
      }

      setIsFormOpen(false);
      await fetchShiftAssignments(page, "table", pageSize);
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
        const errorMessage =
          error.response?.data?.message || "Có lỗi xảy ra khi phân ca";
        toastError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangeStatus = async (
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
      console.error("Error changing shift assignment status:", error);
      toastError("Có lỗi xảy ra khi cập nhật trạng thái phân ca");
    } finally {
      setIsProcessing(false);
    }
  };

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
        statusField="status"
        title="Phân ca làm việc"
        columns={columns}
        data={shiftAssignments}
        pageSize={pageSize}
        totalItems={totalItems}
        currentPage={page}
        onView={(item) => handleOpenForm("view", item)}
        onAdd={() => handleOpenForm("create")}
        onEdit={(item) => handleOpenForm("edit", item)}
        onRefresh={() => fetchShiftAssignments(1, "full")}
        onStatusChange={(item, newStatus) =>
          handleChangeStatus(item, mapToggleToStatus(item, Boolean(newStatus)))
        }
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
        isLoading={isProcessing}
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
