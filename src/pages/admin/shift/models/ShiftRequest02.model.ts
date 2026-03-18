export type SearchShiftRequest = {
    searchCondition: SearchCondition;
    pageInfo: PageInfo;
}

export type SearchCondition = {
    name?: string;
    franchise_id?: string;
    start_time?: string;
    end_time?: string;
    is_active?: boolean | string;
    is_deleted?: boolean| string;
}

export type PageInfo = {
    pageNum: number;
    pageSize: number;
}