import { axiosAdminClient } from "@/api/axios.config";

const BASE = "/api/products";

type ProductSearchApiPayload = {
  searchCondition: {
    keyword: string;
    min_price: number | "";
    max_price: number | "";
    is_active: boolean | "";
    is_deleted: boolean;
  };
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
};

const DEFAULT_SEARCH_PAYLOAD: ProductSearchApiPayload = {
  searchCondition: {
    keyword: "",
    min_price: "",
    max_price: "",
    is_active: "",
    is_deleted: false,
  },
  pageInfo: {
    pageNum: 1,
    pageSize: 10,
  },
};

const toNumberOrEmpty = (value: unknown): number | "" => {
  if (value === "") return "";
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) return parsed;
  }
  return "";
};

const buildSearchPayload = (
  payload: Record<string, unknown> = {},
): ProductSearchApiPayload => {
  if (payload.searchCondition && payload.pageInfo) {
    return payload as unknown as ProductSearchApiPayload;
  }

  let pageNum = DEFAULT_SEARCH_PAYLOAD.pageInfo.pageNum;
  if (typeof payload.pageNum === "number") {
    pageNum = payload.pageNum;
  } else if (typeof payload.page === "number") {
    pageNum = payload.page;
  }

  let pageSize = DEFAULT_SEARCH_PAYLOAD.pageInfo.pageSize;
  if (typeof payload.pageSize === "number") {
    pageSize = payload.pageSize;
  } else if (typeof payload.limit === "number") {
    pageSize = payload.limit;
  }

  return {
    searchCondition: {
      keyword:
        typeof payload.keyword === "string"
          ? payload.keyword
          : DEFAULT_SEARCH_PAYLOAD.searchCondition.keyword,
      min_price: toNumberOrEmpty(payload.min_price),
      max_price: toNumberOrEmpty(payload.max_price),
      is_active:
        typeof payload.is_active === "boolean" || payload.is_active === ""
          ? payload.is_active
          : DEFAULT_SEARCH_PAYLOAD.searchCondition.is_active,
      is_deleted:
        typeof payload.is_deleted === "boolean"
          ? payload.is_deleted
          : DEFAULT_SEARCH_PAYLOAD.searchCondition.is_deleted,
    },
    pageInfo: {
      pageNum,
      pageSize,
    },
  };
};

export const productApi = {
  async getAll() {
    const res = await axiosAdminClient.post(`${BASE}/search`, {
      ...DEFAULT_SEARCH_PAYLOAD,
      pageInfo: {
        ...DEFAULT_SEARCH_PAYLOAD.pageInfo,
        pageSize: 200,
      },
    });
    return res.data;
  },

  async search(payload: {
    keyword?: string;
    min_price?: number | "";
    max_price?: number | "";
    is_active?: boolean | "";
    is_deleted?: boolean;
    pageNum?: number;
    pageSize?: number;
  } = {}) {
    const res = await axiosAdminClient.post(
      `${BASE}/search`,
      buildSearchPayload(payload as Record<string, unknown>),
    );
    return res.data;
  },

  async getById(productId: number | string) {
    const res = await axiosAdminClient.get(`${BASE}/${productId}`);
    return res.data;
  },

  async create(payload: Record<string, unknown>) {
    const res = await axiosAdminClient.post(BASE, payload);
    return res.data;
  },

  async update(productId: number | string, payload: Record<string, unknown>) {
    const res = await axiosAdminClient.put(`${BASE}/${productId}`, payload);
    return res.data;
  },

  async remove(productId: number | string) {
    const res = await axiosAdminClient.delete(`${BASE}/${productId}`);
    return res.data;
  },

  async restore(productId: number | string) {
    const res = await axiosAdminClient.patch(`${BASE}/${productId}/restore`, {});
    return res.data;
  },
};
