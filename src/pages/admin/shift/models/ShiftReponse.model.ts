export type Shift = {
  id: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  name: string;
  franchise_id: string;
  franchise_name?: string;
  start_time: string;
  end_time: string;
};

export type ShiftResponse = {
  data: Shift[];
  pageInfo: {
    pageNum: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};
