export interface SearchCondition {
    keyword?: string;
    opened_at?: string;
    closed_at?: string;
    is_active?: boolean;
    is_deleted?: boolean;
}

export interface PageInfo {
    pageNum: number;
    pageSize: number;
}

export interface data {
    searchCondition: SearchCondition;
    pageInfo: PageInfo;
}