import { axiosAdminClient } from "@/api";

export type PromotionApiItem = {
  id: string;
  name?: string;
  franchise_id?: string | null;
  franchise_name?: string | null;
  product_franchise_id?: string | null;
  product_id?: string | null;
  product_name?: string | null;
  type?: "PERCENT" | "FIXED" | string;
  value?: number | string;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
  is_deleted?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PromotionSearchResponse = {
  success: boolean;
  data: PromotionApiItem[];
  pageInfo?: unknown;
  message?: string;
};

type PromotionSearchParams = {
  franchiseId?: string;
  keyword?: string;
  isDeleted?: boolean;
  type?: "PERCENT" | "FIXED" | "";
  pageNum?: number;
  pageSize?: number;
};

export type PromotionCreatePayload = {
  name: string;
  franchise_id: string;
  product_franchise_id?: string | null;
  type: "PERCENT" | "FIXED";
  value: number;
  start_date: string;
  end_date: string;
};

function buildPromotionSearchPayload({
  franchiseId,
  keyword = "",
  isDeleted = false,
  type = "",
  pageNum = 1,
  pageSize = 200,
}: PromotionSearchParams) {
  return {
    searchCondition: {
      keyword,
      name: keyword,
      ...(franchiseId ? { franchise_id: franchiseId } : {}),
      product_franchise_id: "",
      type,
      value: "",
      start_date: "",
      end_date: "",
      is_active: "",
      is_deleted: isDeleted,
    },
    pageInfo: { pageNum, pageSize },
  };
}

export async function searchPromotionsService(franchiseId?: string) {
  const res = await axiosAdminClient.post<PromotionSearchResponse>(
    "/api/promotions/search",
    buildPromotionSearchPayload({ franchiseId }),
  );
  return res.data;
}

export async function searchPromotionsServiceByKeyword(
  franchiseId: string | undefined,
  keyword: string,
  options?: {
    isDeleted?: boolean;
    type?: "PERCENT" | "FIXED" | "";
  },
) {
  const res = await axiosAdminClient.post<PromotionSearchResponse>(
    "/api/promotions/search",
    buildPromotionSearchPayload({
      franchiseId,
      keyword: keyword ?? "",
      isDeleted: options?.isDeleted ?? false,
      type: options?.type ?? "",
    }),
  );
  return res.data;
}

export async function createPromotionService(payload: PromotionCreatePayload) {
  const res = await axiosAdminClient.post("/api/promotions", payload);
  return res.data as unknown;
}

export type PromotionUpdatePayload = {
  name: string;
  type: "PERCENT" | "FIXED";
  value: number;
  start_date: string;
  end_date: string;
};

export async function updatePromotionService(
  id: string,
  payload: PromotionUpdatePayload,
) {
  const res = await axiosAdminClient.put(`/api/promotions/${id}`, payload);
  return res.data as unknown;
}

export async function deletePromotionService(id: string) {
  const res = await axiosAdminClient.delete(`/api/promotions/${id}`);
  return res.data as unknown;
}

export async function restorePromotionService(id: string) {
  const res = await axiosAdminClient.patch(`/api/promotions/${id}/restore`, {});
  return res.data as unknown;
}

