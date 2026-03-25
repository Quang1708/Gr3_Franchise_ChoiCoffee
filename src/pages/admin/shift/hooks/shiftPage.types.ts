import type { Shift } from "@/pages/admin/shift/models/ShiftReponse.model";
import type { ShiftAssignmentItem } from "@/pages/admin/shift_assignment/models/shiftAssignment.model";

export type SelectOption = {
  value: string;
  label: string;
  franchiseId?: string;
};

export type FranchiseOption = {
  value: string;
  name: string;
};

export type ShiftCreateForm = {
  name: string;
  start_time: string;
  end_time: string;
  franchise_id: string;
};

export type ShiftPageDataState = {
  assignments: ShiftAssignmentItem[];
  shifts: Shift[];
  franchises: FranchiseOption[];
  staffOptions: SelectOption[];
  shiftOptions: SelectOption[];
  lookupLoading: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  shiftForm: ShiftCreateForm;
  setShiftForm: React.Dispatch<React.SetStateAction<ShiftCreateForm>>;
  currentMonth: Date;
  setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
};
