export type StaffUser = {
  id: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  franchise_id: string;
  franchise_code: string;
  franchise_name: string;
  role_id: string;
  role_code: string;
  role_name: string;
  user_id: string;
  user_name: string;
  user_email: string;
  note: string;
};

export type PageInfo = {
  pageNum: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type StaffUserResponse = {
  success: boolean;
  data: StaffUser[];
  pageInfo: PageInfo;
};

export type StaffUserSearchCondition = {
  user_id: string;
  franchise_id: string;
  role_id: string;
  is_deleted: boolean;
};

export type StaffUserRequest = {
  searchCondition: StaffUserSearchCondition;
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
};