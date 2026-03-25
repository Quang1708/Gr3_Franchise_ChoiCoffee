import type { ShiftAssignmentFormValues } from "@/pages/admin/shift_assignment/components/ShiftAssignmentForm";
import type {
  ShiftAssignmentItem,
  ShiftAssignmentStatus,
} from "@/pages/admin/shift_assignment/models/shiftAssignment.model";
import { bulkCreateShiftAssignment } from "@/pages/admin/shift_assignment/usecases/bulkCreateShiftAssignment.usecase";
import { createShiftAssignment } from "@/pages/admin/shift_assignment/usecases/createShiftAssignment.usecase";
import { updateShiftAssignmentStatus } from "@/pages/admin/shift_assignment/usecases/updateShiftAssignmentStatus.usecase";
import { toastError, toastSuccess } from "@/utils/toast.util";
import { useState } from "react";
import type { UseFormSetError } from "react-hook-form";
import { toDateInput } from "../shiftCalendar.utils";

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

type UseShiftAssignmentActionsInput = {
  canAssignmentWrite: boolean;
  refreshLookups: () => Promise<void>;
  refreshAssignments: () => Promise<void>;
};

export const useShiftAssignmentActions = ({
  canAssignmentWrite,
  refreshLookups,
  refreshAssignments,
}: UseShiftAssignmentActionsInput) => {
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [isUpdatingAssignmentStatus, setIsUpdatingAssignmentStatus] =
    useState(false);
  const [isOpeningAssignmentModal, setIsOpeningAssignmentModal] =
    useState(false);
  const [isAssignmentFormOpen, setIsAssignmentFormOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<ShiftAssignmentItem | null>(null);
  const [pickedDate, setPickedDate] = useState(toDateInput(new Date()));
  const [isDayAssignmentsModalOpen, setIsDayAssignmentsModalOpen] =
    useState(false);
  const [dayAssignmentsDate, setDayAssignmentsDate] = useState("");
  const [dayAssignments, setDayAssignments] = useState<ShiftAssignmentItem[]>(
    [],
  );

  const handleOpenAssignmentCreate = (date?: string) => {
    if (!canAssignmentWrite) {
      toastError("Bạn không có quyền phân ca");
      return;
    }

    setPickedDate(date || toDateInput(new Date()));
    setSelectedAssignment(null);
    setIsAssignmentFormOpen(true);
    setIsOpeningAssignmentModal(true);
    void refreshLookups().finally(() => {
      setIsOpeningAssignmentModal(false);
    });
  };

  const handleOpenAssignmentView = (assignment: ShiftAssignmentItem) => {
    setSelectedAssignment(assignment);
    setIsAssignmentFormOpen(true);
    setIsOpeningAssignmentModal(true);
    void refreshLookups().finally(() => {
      setIsOpeningAssignmentModal(false);
    });
  };

  const handleOpenDayAssignments = (
    date: string,
    items: ShiftAssignmentItem[],
  ) => {
    if (!items.length) return;
    setDayAssignmentsDate(date);
    setDayAssignments(items);
    setIsDayAssignmentsModalOpen(true);
  };

  const handleOpenAssignmentFromDayList = (assignment: ShiftAssignmentItem) => {
    setIsDayAssignmentsModalOpen(false);
    handleOpenAssignmentView(assignment);
  };

  const handleSubmitAssignment = async (
    data: ShiftAssignmentFormValues,
    setError: UseFormSetError<ShiftAssignmentFormValues>,
  ) => {
    setIsCreatingAssignment(true);
    try {
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

      toastSuccess("Phân ca thành công");
      await refreshAssignments();
      setIsAssignmentFormOpen(false);
      setSelectedAssignment(null);
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
            errors?: Array<{ field: string; message: string }>;
          };
        };
      };

      const fieldErrors = err.response?.data?.errors;
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        fieldErrors.forEach((item) => {
          if (
            item.field === "user_id" ||
            item.field === "shift_id" ||
            item.field === "work_date" ||
            item.field === "note"
          ) {
            setError(item.field, {
              type: "manual",
              message: item.message,
            });
          } else {
            toastError(item.message);
          }
        });
      } else {
        const apiMessage = err.response?.data?.message;
        const displayMessage = mapShiftAssignmentSubmitErrorMessage(apiMessage);
        toastError(displayMessage);
      }
    } finally {
      setIsCreatingAssignment(false);
    }
  };

  const handleChangeAssignmentStatus = async (
    status: ShiftAssignmentStatus,
  ) => {
    if (!selectedAssignment?.id) return;

    try {
      setIsUpdatingAssignmentStatus(true);
      await updateShiftAssignmentStatus(selectedAssignment.id, status);

      setSelectedAssignment((prev) =>
        prev
          ? {
              ...prev,
              status,
            }
          : prev,
      );

      await refreshAssignments();
      toastSuccess("Cập nhật trạng thái phân ca thành công");
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
      console.error("Error changing shift assignment status", error);
      toastError(displayMessage);
    } finally {
      setIsUpdatingAssignmentStatus(false);
    }
  };

  return {
    isCreatingAssignment,
    isUpdatingAssignmentStatus,
    isOpeningAssignmentModal,
    isAssignmentFormOpen,
    setIsAssignmentFormOpen,
    selectedAssignment,
    setSelectedAssignment,
    pickedDate,
    isDayAssignmentsModalOpen,
    setIsDayAssignmentsModalOpen,
    dayAssignmentsDate,
    dayAssignments,
    handleOpenAssignmentCreate,
    handleOpenAssignmentView,
    handleOpenDayAssignments,
    handleOpenAssignmentFromDayList,
    handleSubmitAssignment,
    handleChangeAssignmentStatus,
  };
};
