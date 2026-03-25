import { useShiftAssignmentActions } from "./useShiftAssignmentActions";
import { useShiftCreateActions } from "./useShiftCreateActions";
import { useShiftPageData } from "./useShiftPageData";
import { useShiftPageScope } from "./useShiftPageScope";

export const useShiftPageController = () => {
  const scope = useShiftPageScope();

  const data = useShiftPageData({
    selectedFranchiseId: scope.selectedFranchiseId,
    effectiveFranchiseId: scope.effectiveFranchiseId,
    franchiseId: scope.franchiseId,
    isAdmin: scope.isAdmin,
    isManager: scope.isManager,
    isStaff: scope.isStaff,
    currentUserId: scope.currentUserId,
    canShiftRead: scope.canShiftRead,
    canShiftWrite: scope.canShiftWrite,
    canAssignmentRead: scope.canAssignmentRead,
    canAssignmentWrite: scope.canAssignmentWrite,
    isGlobalContext: scope.isGlobalContext,
    showShiftFranchiseLabel: scope.showShiftFranchiseLabel,
  });

  const shiftCreateActions = useShiftCreateActions({
    canShiftWrite: scope.canShiftWrite,
    isGlobalContext: scope.isGlobalContext,
    franchiseId: scope.franchiseId,
    shiftForm: data.shiftForm,
    setShiftForm: data.setShiftForm,
    refreshShifts: data.refreshShifts,
    refreshLookups: data.refreshLookups,
  });

  const assignmentActions = useShiftAssignmentActions({
    canAssignmentWrite: scope.canAssignmentWrite,
    refreshLookups: data.refreshLookups,
    refreshAssignments: data.refreshAssignments,
  });

  return {
    canShiftRead: scope.canShiftRead,
    canShiftWrite: scope.canShiftWrite,
    canAssignmentRead: scope.canAssignmentRead,
    canAssignmentWrite: scope.canAssignmentWrite,
    isStaff: scope.isStaff,

    isLoading: data.isLoading,
    isRefreshing: data.isRefreshing,
    lookupLoading: data.lookupLoading,
    isCreatingShift: shiftCreateActions.isCreatingShift,
    isCreatingAssignment: assignmentActions.isCreatingAssignment,
    isUpdatingAssignmentStatus: assignmentActions.isUpdatingAssignmentStatus,
    isOpeningAssignmentModal: assignmentActions.isOpeningAssignmentModal,

    currentMonth: data.currentMonth,
    setCurrentMonth: data.setCurrentMonth,
    calendarDays: data.calendarDays,
    monthAssignmentsCount: data.monthAssignmentsCount,
    assignmentsByDate: data.assignmentsByDate,

    visibleShifts: data.visibleShifts,
    franchiseNameMap: data.franchiseNameMap,
    shiftForm: data.shiftForm,
    setShiftForm: data.setShiftForm,
    franchises: data.franchises,
    isGlobalContext: scope.isGlobalContext,
    showShiftFranchiseLabel: scope.showShiftFranchiseLabel,

    isAssignmentFormOpen: assignmentActions.isAssignmentFormOpen,
    setIsAssignmentFormOpen: assignmentActions.setIsAssignmentFormOpen,
    selectedAssignment: assignmentActions.selectedAssignment,
    setSelectedAssignment: assignmentActions.setSelectedAssignment,
    pickedDate: assignmentActions.pickedDate,
    isDayAssignmentsModalOpen: assignmentActions.isDayAssignmentsModalOpen,
    setIsDayAssignmentsModalOpen:
      assignmentActions.setIsDayAssignmentsModalOpen,
    dayAssignmentsDate: assignmentActions.dayAssignmentsDate,
    dayAssignments: assignmentActions.dayAssignments,

    staffOptions: data.staffOptions,
    shiftOptions: data.shiftOptions,

    refreshAll: data.refreshAll,
    handleCreateShift: shiftCreateActions.handleCreateShift,
    handleOpenAssignmentCreate: assignmentActions.handleOpenAssignmentCreate,
    handleOpenAssignmentView: assignmentActions.handleOpenAssignmentView,
    handleOpenDayAssignments: assignmentActions.handleOpenDayAssignments,
    handleOpenAssignmentFromDayList:
      assignmentActions.handleOpenAssignmentFromDayList,
    handleSubmitAssignment: assignmentActions.handleSubmitAssignment,
    handleChangeAssignmentStatus:
      assignmentActions.handleChangeAssignmentStatus,
  };
};
