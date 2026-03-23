import { can } from "@/auth/rbac";
import { PERM } from "@/auth/rbac.permissions";
import { createShift } from "@/components/Admin/shift/services/shift01.service";
import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import ClientLoading from "@/components/Client/Client.Loading";
import { getAllFranchises } from "@/components/categoryFranchise/services/franchise08.service";
import type { Shift } from "@/pages/admin/shift/models/ShiftReponse.model";
import ShiftAssignmentForm, {
  type ShiftAssignmentFormValues,
} from "@/pages/admin/shift_assignment/components/ShiftAssignmentForm";
import type { ShiftAssignmentItem } from "@/pages/admin/shift_assignment/models/shiftAssignment.model";
import { createShiftAssignment } from "@/pages/admin/shift_assignment/usecases/createShiftAssignment.usecase";
import { loadLookupOptions } from "@/pages/admin/shift_assignment/usecases/loadLookupOptions.usecase";
import { searchShiftAssignment } from "@/pages/admin/shift_assignment/usecases/searchShiftAssignment.usecase";
import { searchShift } from "@/pages/admin/shift/usecases/searchShift.usecase";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { useAuthStore } from "@/stores/auth.store";
import { toastError, toastSuccess } from "@/utils/toast.util";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import type { UseFormSetError } from "react-hook-form";
import ShiftCalendarSection from "./components/ShiftCalendarSection";
import ShiftSidebarSection from "./components/ShiftSidebarSection";
import ShiftWorkspaceHeader from "./components/ShiftWorkspaceHeader";
import {
  buildCalendarDays,
  getTimeRange,
  toDateInput,
} from "./shiftCalendar.utils";

type SelectOption = {
  value: string;
  label: string;
};

type FranchiseOption = {
  value: string;
  name: string;
};

type ShiftCreateForm = {
  name: string;
  start_time: string;
  end_time: string;
  franchise_id: string;
};

const ShiftPage = () => {
  const user = useAuthStore((s) => s.user);
  const selectedFranchiseId = useAdminContextStore(
    (s) => s.selectedFranchiseId,
  );
  const franchiseId = selectedFranchiseId ?? "";
  const isGlobalContext = selectedFranchiseId === null;

  const canShiftRead = useMemo(
    () => can(user, PERM.SHIFT_READ, franchiseId || undefined),
    [franchiseId, user],
  );
  const canShiftWrite = useMemo(
    () => can(user, PERM.SHIFT_WRITE, franchiseId || undefined),
    [franchiseId, user],
  );
  const canAssignmentRead = useMemo(
    () => can(user, PERM.SHIFT_ASSIGNMENT_READ, franchiseId || undefined),
    [franchiseId, user],
  );
  const canAssignmentWrite = useMemo(
    () => can(user, PERM.SHIFT_ASSIGNMENT_WRITE, franchiseId || undefined),
    [franchiseId, user],
  );

  const [currentMonth, setCurrentMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const [assignments, setAssignments] = useState<ShiftAssignmentItem[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [franchises, setFranchises] = useState<FranchiseOption[]>([]);

  const [staffOptions, setStaffOptions] = useState<SelectOption[]>([]);
  const [shiftOptions, setShiftOptions] = useState<SelectOption[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreatingShift, setIsCreatingShift] = useState(false);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [isOpeningAssignmentModal, setIsOpeningAssignmentModal] =
    useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);

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
      },
      pageInfo: {
        pageNum: 1,
        pageSize: 500,
      },
    });

    setAssignments(response.items);
  }, [canAssignmentRead]);

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
      const options = await loadLookupOptions(selectedFranchiseId);
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
  }, [canAssignmentWrite, selectedFranchiseId]);

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

  const assignmentsByDate = useMemo(() => {
    return assignments.reduce<Record<string, ShiftAssignmentItem[]>>(
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
  }, [assignments]);

  const monthAssignmentsCount = useMemo(() => {
    return assignments.filter((item) => item.work_date.startsWith(monthKey))
      .length;
  }, [assignments, monthKey]);

  const franchiseNameMap = useMemo(() => {
    return franchises.reduce<Record<string, string>>((acc, item) => {
      acc[item.value] = item.name;
      return acc;
    }, {});
  }, [franchises]);

  const visibleShifts = useMemo(() => {
    return shifts.filter((item) => {
      if (franchiseId === "") return true;
      return item.franchise_id === franchiseId;
    });
  }, [franchiseId, shifts]);

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
      await createShiftAssignment({
        user_id: data.user_id,
        shift_id: data.shift_id,
        work_date: data.work_date,
        note: data.note,
      });

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
        toastError(err.response?.data?.message || "Không thể phân ca");
      }
    } finally {
      setIsCreatingAssignment(false);
    }
  };

  if (isLoading) {
    return <ClientLoading />;
  }

  return (
    <div className="space-y-4 xl:flex xl:h-[calc(100dvh-8.5rem)] xl:flex-col xl:overflow-hidden">
      <ShiftWorkspaceHeader
        isRefreshing={isRefreshing}
        canAssignmentWrite={canAssignmentWrite}
        onRefresh={() => {
          void refreshAll();
        }}
        onCreateAssignment={() => {
          void handleOpenAssignmentCreate();
        }}
      />

      <div className="grid grid-cols-1 gap-4 xl:min-h-0 xl:flex-1 xl:grid-cols-12">
        <ShiftCalendarSection
          canAssignmentRead={canAssignmentRead}
          canAssignmentWrite={canAssignmentWrite}
          monthAssignmentsCount={monthAssignmentsCount}
          currentMonth={currentMonth}
          calendarDays={calendarDays}
          assignmentsByDate={assignmentsByDate}
          onPrevMonth={() =>
            setCurrentMonth(
              (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
            )
          }
          onNextMonth={() =>
            setCurrentMonth(
              (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
            )
          }
          onOpenCreateAssignment={(date) => {
            void handleOpenAssignmentCreate(date);
          }}
          onOpenViewAssignment={(assignment) => {
            void handleOpenAssignmentView(assignment);
          }}
          onOpenDayAssignments={(date, items) => {
            handleOpenDayAssignments(date, items);
          }}
        />

        <ShiftSidebarSection
          canShiftRead={canShiftRead}
          canShiftWrite={canShiftWrite}
          isGlobalContext={isGlobalContext}
          isCreatingShift={isCreatingShift}
          shiftForm={shiftForm}
          franchises={franchises}
          visibleShifts={visibleShifts}
          franchiseNameMap={franchiseNameMap}
          onFormChange={setShiftForm}
          onCreateShift={handleCreateShift}
        />
      </div>

      <ShiftAssignmentForm
        isOpen={isAssignmentFormOpen}
        mode={selectedAssignment ? "view" : "create"}
        initialData={selectedAssignment || { work_date: pickedDate }}
        isLoading={isCreatingAssignment || isOpeningAssignmentModal}
        onClose={() => {
          setIsAssignmentFormOpen(false);
          setSelectedAssignment(null);
        }}
        onSubmit={(data, setError) => {
          void handleSubmitAssignment(data, setError);
        }}
        staffOptions={staffOptions}
        shiftOptions={shiftOptions}
        lookupLoading={lookupLoading}
      />

      <CRUDModalTemplate
        isOpen={isDayAssignmentsModalOpen}
        onClose={() => setIsDayAssignmentsModalOpen(false)}
        title={`ca ngày ${dayAssignmentsDate}`}
        mode="view"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-2">
          {dayAssignments.length === 0 ? (
            <p className="text-sm text-gray-500">
              Không có ca nào trong ngày này.
            </p>
          ) : (
            dayAssignments.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleOpenAssignmentFromDayList(item)}
                className="cursor-pointer w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left hover:bg-gray-50"
              >
                <div className="text-sm font-semibold text-gray-800">
                  {item.user_name ?? item.user_id}
                </div>
                <div className="text-xs text-gray-600">
                  {getTimeRange(item)}
                </div>
              </button>
            ))
          )}
        </div>
      </CRUDModalTemplate>

      {isRefreshing && <ClientLoading />}
    </div>
  );
};

export default ShiftPage;
