import { getAllFranchises } from "@/components/categoryFranchise/services/franchise08.service";
import type { Shift } from "@/pages/admin/shift/models/ShiftReponse.model";
import type { ShiftAssignmentItem } from "@/pages/admin/shift_assignment/models/shiftAssignment.model";
import { loadLookupOptions } from "@/pages/admin/shift_assignment/usecases/loadLookupOptions.usecase";
import { searchShiftAssignment } from "@/pages/admin/shift_assignment/usecases/searchShiftAssignment.usecase";
import { searchShift } from "@/pages/admin/shift/usecases/searchShift.usecase";
import { toastError } from "@/utils/toast.util";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buildCalendarDays } from "../shiftCalendar.utils";
import type {
  FranchiseOption,
  SelectOption,
  ShiftCreateForm,
} from "./shiftPage.types";

type ScopeInput = {
  selectedFranchiseId: string | null;
  effectiveFranchiseId: string;
  franchiseId: string;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  currentUserId: string;
  canShiftRead: boolean;
  canShiftWrite: boolean;
  canAssignmentRead: boolean;
  canAssignmentWrite: boolean;
  isGlobalContext: boolean;
  showShiftFranchiseLabel: boolean;
};

export const useShiftPageData = (scope: ScopeInput) => {
  const {
    selectedFranchiseId,
    effectiveFranchiseId,
    franchiseId,
    isAdmin,
    isManager,
    isStaff,
    currentUserId,
    canShiftRead,
    canShiftWrite,
    canAssignmentRead,
    canAssignmentWrite,
    isGlobalContext,
    showShiftFranchiseLabel,
  } = scope;

  const [currentMonth, setCurrentMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [assignments, setAssignments] = useState<ShiftAssignmentItem[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [franchises, setFranchises] = useState<FranchiseOption[]>([]);
  const [staffOptions, setStaffOptions] = useState<SelectOption[]>([]);
  const [shiftOptions, setShiftOptions] = useState<SelectOption[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shiftForm, setShiftForm] = useState<ShiftCreateForm>({
    name: "",
    start_time: "",
    end_time: "",
    franchise_id: franchiseId,
  });

  const refreshAssignments = useCallback(async () => {
    if (!canAssignmentRead) {
      setAssignments([]);
      return;
    }

    const response = await searchShiftAssignment({
      searchCondition: {
        is_deleted: false,
        user_id: isStaff ? currentUserId : "",
      },
      pageInfo: {
        pageNum: 1,
        pageSize: 500,
      },
    });

    setAssignments(response.items);
  }, [canAssignmentRead, currentUserId, isStaff]);

  const refreshShifts = useCallback(async () => {
    if (!canShiftRead && !canShiftWrite) {
      setShifts([]);
      return;
    }

    const response = await searchShift({
      searchCondition: {
        franchise_id: franchiseId,
        is_deleted: false,
      },
      pageInfo: {
        pageNum: 1,
        pageSize: 200,
      },
    });

    setShifts(response.data ?? []);
  }, [canShiftRead, canShiftWrite, franchiseId]);

  const refreshLookups = useCallback(async () => {
    if (!canAssignmentWrite) {
      setStaffOptions([]);
      setShiftOptions([]);
      return;
    }

    setLookupLoading(true);
    try {
      const options = await loadLookupOptions({
        franchiseId: effectiveFranchiseId || selectedFranchiseId,
        allowedFranchiseIds:
          isManager && effectiveFranchiseId ? [effectiveFranchiseId] : [],
        restrictToUserId: isStaff ? currentUserId : "",
        includeFranchiseName: showShiftFranchiseLabel,
      });
      setStaffOptions(options.staffOptions);
      setShiftOptions(options.shiftOptions);
    } catch (error) {
      console.error("Error loading shift assignment lookups", error);
      setStaffOptions([]);
      setShiftOptions([]);
      toastError("Không thể tải danh sách nhân viên hoặc ca làm");
    } finally {
      setLookupLoading(false);
    }
  }, [
    canAssignmentWrite,
    currentUserId,
    effectiveFranchiseId,
    isManager,
    isStaff,
    selectedFranchiseId,
    showShiftFranchiseLabel,
  ]);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshAssignments(),
        refreshShifts(),
        refreshLookups(),
      ]);
    } catch (error) {
      console.error("Error refreshing shift data", error);
      toastError("Không thể tải dữ liệu ca làm");
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [refreshAssignments, refreshLookups, refreshShifts]);

  useEffect(() => {
    const loadFranchises = async () => {
      try {
        const data = await getAllFranchises();
        setFranchises(data ?? []);
      } catch (error) {
        console.error("Error loading franchises", error);
      }
    };

    void loadFranchises();
  }, []);

  useEffect(() => {
    setShiftForm((prev) => ({
      ...prev,
      franchise_id: franchiseId,
    }));
  }, [franchiseId]);

  useEffect(() => {
    if (!isGlobalContext) return;
    if (shiftForm.franchise_id) return;
    if (franchises.length === 0) return;

    setShiftForm((prev) => ({
      ...prev,
      franchise_id: prev.franchise_id || franchises[0].value,
    }));
  }, [franchises, isGlobalContext, shiftForm.franchise_id]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const calendarDays = useMemo(
    () => buildCalendarDays(currentMonth),
    [currentMonth],
  );

  const monthKey = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }, [currentMonth]);

  const visibleShifts = useMemo(() => {
    return shifts.filter((item) => {
      if (!franchiseId) return isAdmin;
      return item.franchise_id === franchiseId;
    });
  }, [franchiseId, isAdmin, shifts]);

  const visibleShiftIds = useMemo(
    () => new Set(visibleShifts.map((item) => String(item.id))),
    [visibleShifts],
  );

  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      if (isStaff) {
        return String(item.user_id) === currentUserId;
      }

      return visibleShiftIds.has(String(item.shift_id));
    });
  }, [assignments, currentUserId, isStaff, visibleShiftIds]);

  const assignmentsByDate = useMemo(() => {
    return filteredAssignments.reduce<Record<string, ShiftAssignmentItem[]>>(
      (acc, item) => {
        const key = item.work_date;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      },
      {},
    );
  }, [filteredAssignments]);

  const monthAssignmentsCount = useMemo(
    () =>
      filteredAssignments.filter((item) => item.work_date.startsWith(monthKey))
        .length,
    [filteredAssignments, monthKey],
  );

  const franchiseNameMap = useMemo(() => {
    return franchises.reduce<Record<string, string>>((acc, item) => {
      acc[item.value] = item.name;
      return acc;
    }, {});
  }, [franchises]);

  return {
    assignments,
    shifts,
    franchises,
    staffOptions,
    shiftOptions,
    lookupLoading,
    isLoading,
    isRefreshing,
    shiftForm,
    setShiftForm,
    currentMonth,
    setCurrentMonth,
    calendarDays,
    monthAssignmentsCount,
    assignmentsByDate,
    visibleShifts,
    franchiseNameMap,
    refreshAssignments,
    refreshShifts,
    refreshLookups,
    refreshAll,
  };
};
