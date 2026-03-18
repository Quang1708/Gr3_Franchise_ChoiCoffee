export type ShiftAssignmentStatus =
  | "ASSIGNED"
  | "COMPLETED"
  | "ABSENT"
  | "CANCELED";

export interface ShiftAssignmentItem {
  id: string;
  user_id: string;
  user_name?: string;
  shift_id: string;
  start_time?: string;
  end_time?: string;
  work_date: string;
  assigned_by?: string;
  assigned_by_name?: string;
  note?: string;
  status: ShiftAssignmentStatus;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type ShiftAssignmentBulkRow = {
  user_id: string;
  shift_id: string;
  work_date: string;
  note?: string;
};

export interface ShiftAssignmentCreatePayload {
  user_id: string;
  shift_id: string;
  work_date: string;
  note?: string;
}

export interface ShiftAssignmentBulkPayload {
  items: Array<{
    shift_id: string;
    user_id: string;
    work_date: string;
    note?: string;
  }>;
}

export interface ShiftAssignmentSearchPayload {
  searchCondition: {
    shift_id?: string;
    user_id?: string;
    work_date?: string;
    assigned_by?: string;
    status?: ShiftAssignmentStatus | "";
    is_deleted?: boolean;
  };
  pageInfo?: {
    pageNum: number;
    pageSize: number;
  };
}

export interface ShiftAssignmentStatusPayload {
  status: ShiftAssignmentStatus;
}
