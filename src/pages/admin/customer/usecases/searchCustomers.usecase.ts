import { searchCustomersApi } from "../services/customer03.service";

export const searchCustomersUsecase = async ({
    keyword,
    isActive,
    pageNum,
    pageSize,
}: {
    keyword?: string;
    isActive?: string | boolean;
    pageNum: number;
    pageSize: number;
}) => {
    const response = await searchCustomersApi({
        searchCondition: {
            keyword: keyword || "",
            is_active: isActive ?? "",
            is_deleted: "", 
        },
        pageInfo: {
            pageNum,
            pageSize,
        },
    });

    return response;
};