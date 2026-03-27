import { axiosAdminClient } from "@/api";

export const searchOrdersByCustomer = async (customerId: string, status?: string) => {
    try{
        const response = await axiosAdminClient.get(
            `/api/orders/customer/${customerId}?status=${status}`
        )
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error);
        throw error;
    }
};

export const searchOrderByFranchiseId= async (franchise_id: string, status?: string) => {
    try{
        const response = await axiosAdminClient.get(
            `/api/orders/franchise/${franchise_id}?status=${status}`
        )
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error);
        throw error;
    }
}

export const getOrdersByFranchiseId = async (franchiseId?: string | null) => {
    const tryFetch = async (url: string) => {
        try {
            const response = await axiosAdminClient.get(url);
            return response.data;
        } catch (error) {
            const status = (error as { response?: { status?: number } })?.response?.status;
            if (status === 404) {
                return null;
            }
            throw error;
        }
    };

    if (!franchiseId) {
        // Admin mode: thử nhiều endpoint list order khác nhau
        const candidates = [
            `/api/orders`,
            `/api/orders/list`,
            `/api/orders/all`,
            `/api/orders/staff`,
        ];
        for (const route of candidates) {
            const data = await tryFetch(route);
            if (data != null) return data;
        }
        throw new Error("Không tìm thấy endpoint lấy danh sách đơn hàng");
    }

    // Franchise mode: thử nhiều endpoint franchise-specific
    const branchCandidates = [
        `/api/orders/staff/franchiseId/${franchiseId}`,
        `/api/orders/franchise/${franchiseId}`,
        `/api/orders/staff/${franchiseId}`,
        `/api/orders/franchiseId/${franchiseId}`,
    ];
    for (const route of branchCandidates) {
        const data = await tryFetch(route);
        if (data != null) return data;
    }

    throw new Error("Không tìm thấy endpoint lấy đơn hàng theo chi nhánh");
};