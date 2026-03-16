export type SearchShiftRequest = {
    searchCondition: SearchCondition;
    pageInfo: PageInfo;
}

export type SearchCondition = {
    name?: string;
    franchise_id?: string;
    start_time?: string;
    end_time?: string;
    is_active?: boolean | "";
    is_deleted?: boolean| "";
}

export type PageInfo = {
    pageNum: number;
    pageSize: number;
}