import { createShift } from "@/components/Admin/shift/services/shift01.service";
import { toastError, toastSuccess } from "@/utils/toast.util";
import { useState, type FormEvent } from "react";
import type { ShiftCreateForm } from "./shiftPage.types";

type UseShiftCreateActionsInput = {
  canShiftWrite: boolean;
  isGlobalContext: boolean;
  franchiseId: string;
  shiftForm: ShiftCreateForm;
  setShiftForm: React.Dispatch<React.SetStateAction<ShiftCreateForm>>;
  refreshShifts: () => Promise<void>;
  refreshLookups: () => Promise<void>;
};

export const useShiftCreateActions = ({
  canShiftWrite,
  isGlobalContext,
  franchiseId,
  shiftForm,
  setShiftForm,
  refreshShifts,
  refreshLookups,
}: UseShiftCreateActionsInput) => {
  const [isCreatingShift, setIsCreatingShift] = useState(false);

  const handleCreateShift = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canShiftWrite) {
      toastError("Bạn không có quyền tạo ca làm");
      return;
    }

    if (!shiftForm.name || !shiftForm.start_time || !shiftForm.end_time) {
      toastError("Vui lòng nhập đầy đủ thông tin ca làm");
      return;
    }

    if (isGlobalContext && !shiftForm.franchise_id) {
      toastError("Vui lòng chọn chi nhánh");
      return;
    }

    setIsCreatingShift(true);
    try {
      await createShift({
        name: shiftForm.name.trim(),
        start_time: shiftForm.start_time,
        end_time: shiftForm.end_time,
        franchise_id: isGlobalContext ? shiftForm.franchise_id : franchiseId,
      });
      toastSuccess("Tạo ca làm thành công");

      setShiftForm((prev) => ({
        ...prev,
        name: "",
        start_time: "",
        end_time: "",
      }));

      await Promise.all([refreshShifts(), refreshLookups()]);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toastError(err.response?.data?.message || "Không thể tạo ca làm");
    } finally {
      setIsCreatingShift(false);
    }
  };

  return {
    isCreatingShift,
    handleCreateShift,
  };
};
