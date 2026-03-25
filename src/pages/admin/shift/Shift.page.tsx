import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import ClientLoading from "@/components/Client/Client.Loading";
import ShiftAssignmentForm from "@/pages/admin/shift_assignment/components/ShiftAssignmentForm";
import { useShiftPageController } from "./hooks/useShiftPageController";
import ShiftCalendarSection from "./components/ShiftCalendarSection";
import ShiftSidebarSection from "./components/ShiftSidebarSection";
import ShiftWorkspaceHeader from "./components/ShiftWorkspaceHeader";
import { getTimeRange } from "./shiftCalendar.utils";

const ShiftPage = () => {
  const {
    canShiftRead,
    canShiftWrite,
    canAssignmentRead,
    canAssignmentWrite,
    isStaff,
    isLoading,
    isRefreshing,
    isCreatingShift,
    isCreatingAssignment,
    isUpdatingAssignmentStatus,
    isOpeningAssignmentModal,
    lookupLoading,
    currentMonth,
    setCurrentMonth,
    calendarDays,
    monthAssignmentsCount,
    assignmentsByDate,
    visibleShifts,
    franchiseNameMap,
    shiftForm,
    setShiftForm,
    franchises,
    isGlobalContext,
    showShiftFranchiseLabel,
    isAssignmentFormOpen,
    setIsAssignmentFormOpen,
    selectedAssignment,
    setSelectedAssignment,
    pickedDate,
    isDayAssignmentsModalOpen,
    setIsDayAssignmentsModalOpen,
    dayAssignmentsDate,
    dayAssignments,
    staffOptions,
    shiftOptions,
    refreshAll,
    handleCreateShift,
    handleOpenAssignmentCreate,
    handleOpenAssignmentView,
    handleOpenDayAssignments,
    handleOpenAssignmentFromDayList,
    handleSubmitAssignment,
    handleChangeAssignmentStatus,
  } = useShiftPageController();

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
          fullWidth={isStaff}
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

        {!isStaff && (
          <ShiftSidebarSection
            canShiftRead={canShiftRead}
            canShiftWrite={canShiftWrite}
            showFranchiseLabel={showShiftFranchiseLabel}
            isGlobalContext={isGlobalContext}
            isCreatingShift={isCreatingShift}
            shiftForm={shiftForm}
            franchises={franchises}
            visibleShifts={visibleShifts}
            franchiseNameMap={franchiseNameMap}
            onFormChange={setShiftForm}
            onCreateShift={handleCreateShift}
          />
        )}
      </div>

      <ShiftAssignmentForm
        isOpen={isAssignmentFormOpen}
        mode={selectedAssignment ? "view" : "create"}
        initialData={selectedAssignment || undefined}
        defaultWorkDate={selectedAssignment ? undefined : pickedDate}
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
        canUpdateStatus={
          Boolean(selectedAssignment) && canAssignmentWrite && !isStaff
        }
        isUpdatingStatus={isUpdatingAssignmentStatus}
        onUpdateStatus={(status) => {
          void handleChangeAssignmentStatus(status);
        }}
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

      {(isRefreshing || isCreatingShift) && <ClientLoading />}
    </div>
  );
};

export default ShiftPage;
