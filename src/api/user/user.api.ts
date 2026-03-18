import { axiosAdminClient } from "@/api/axios.config";

const BASE = "/api/users";

type UserSearchApiPayload = {
  searchCondition: {
    keyword: string;
    is_active: boolean | "";
    is_deleted: boolean | "";
  };
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
};

const DEFAULT_SEARCH_PAYLOAD: UserSearchApiPayload = {
  searchCondition: {
    keyword: "",
    is_active: "",
    is_deleted: "",
  },
  pageInfo: {
    pageNum: 1,
    pageSize: 10,
  },
};

const buildSearchPayload = (
  payload: Record<string, unknown> = {},
): UserSearchApiPayload => {
  if (payload.searchCondition && payload.pageInfo) {
    return payload as unknown as UserSearchApiPayload;
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
      is_active:
        typeof payload.is_active === "boolean" || payload.is_active === ""
          ? payload.is_active
          : DEFAULT_SEARCH_PAYLOAD.searchCondition.is_active,
      is_deleted:
        typeof payload.is_deleted === "boolean" || payload.is_deleted === ""
          ? payload.is_deleted
          : DEFAULT_SEARCH_PAYLOAD.searchCondition.is_deleted,
    },
    pageInfo: {
      pageNum,
      pageSize,
    },
  };
};

export const userApi = {
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
    is_active?: boolean | "";
    is_deleted?: boolean | "";
    pageNum?: number;
    pageSize?: number;
  } = {}) {
    const res = await axiosAdminClient.post(
      `${BASE}/search`,
      buildSearchPayload(payload as Record<string, unknown>),
    );
    return res.data;
  },

  async getById(userId: number | string) {
    const res = await axiosAdminClient.get(`${BASE}/${userId}`);
    return res.data;
  },

  async create(payload: Record<string, unknown>) {
    const res = await axiosAdminClient.post(BASE, payload);
    return res.data;
  },

  async update(userId: number | string, payload: Record<string, unknown>) {
    const res = await axiosAdminClient.put(`${BASE}/${userId}`, payload);
    return res.data;
  },

  async remove(userId: number | string) {
    const res = await axiosAdminClient.delete(`${BASE}/${userId}`);
    return res.data;
  },

  async restore(userId: number | string) {
    const res = await axiosAdminClient.patch(`${BASE}/${userId}/restore`, {});
    return res.data;
  },

  async changeStatus(userId: number | string, payload: Record<string, unknown>) {
    const res = await axiosAdminClient.patch(`${BASE}/${userId}/status`, payload);
    return res.data;
  },
};
