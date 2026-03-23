import { axiosAdminClient } from "@/api/axios.config";
import type { Voucher, VoucherType } from "@/models/voucher.model";

const BASE = "/api/vouchers";

function unwrapPayload(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const data = obj.data;
    if (data && typeof data === "object") return data as Record<string, unknown>;
    return obj;
  }
  return {};
}

function toVoucher(raw: Record<string, unknown>): Voucher {
  const id = String(raw.id ?? raw.ID ?? "");
  const code = String(raw.code ?? "");
  const franchiseId = String(raw.franchiseId ?? raw.franchise_id ?? "");
  const franchiseName = String(raw.franchiseName ?? raw.franchise_name ?? "");
  const pf = raw.productFranchiseId ?? raw.product_franchise_id;
  const productFranchiseId =
    pf == null || pf === "" ? null : String(pf);
  const productName = String(raw.productName ?? raw.product_name ?? "");
  const name = String(raw.name ?? "");
  const description = String(raw.description ?? "");
  const type = String(raw.type ?? "PERCENT").toUpperCase() as VoucherType;
  const value = Number(raw.value ?? 0);
  const quotaTotal = Number(raw.quotaTotal ?? raw.quota_total ?? 0);
  const quotaUsed = Number(raw.quotaUsed ?? raw.quota_used ?? 0);
  const startTime = String(
    raw.startTime ?? raw.start_time ?? raw.startDate ?? raw.start_date ?? "",
  );
  const endTime = String(
    raw.endTime ?? raw.end_time ?? raw.endDate ?? raw.end_date ?? "",
  );
  const isActive = Boolean(raw.isActive ?? raw.is_active ?? true);
  const isDeleted = Boolean(raw.isDeleted ?? raw.is_deleted ?? false);
  const createdByRaw = raw.createdBy ?? raw.created_by;
  const createdBy =
    typeof createdByRaw === "string" || typeof createdByRaw === "number"
      ? createdByRaw
      : undefined;
  const createdAt = String(raw.createdAt ?? raw.created_at ?? "");
  const updatedAt = String(raw.updatedAt ?? raw.updated_at ?? "");

  return {
    id,
    code,
    franchiseId,
    franchiseName: franchiseName || undefined,
    productFranchiseId,
    productName: productName || undefined,
    name,
    description,
    type: type === "FIXED" ? "FIXED" : "PERCENT",
    value,
    quotaTotal,
    quotaUsed,
    startTime,
    endTime,
    isActive,
    isDeleted,
    createdBy,
    createdAt,
    updatedAt,
  };
}

export type VoucherCreatePayload = {
  code: string;
  franchiseId: string;
  productFranchiseId?: string | null;
  name: string;
  description?: string;
  type: VoucherType;
  value: number;
  quotaTotal?: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
  createdBy?: number;
};

export type VoucherUpdatePayload = Partial<VoucherCreatePayload>;

export type VoucherSearchPayload = {
  keyword?: string;
  code?: string;
  franchiseId?: string;
  type?: VoucherType;
  isActive?: boolean;
  isDeleted?: boolean;
  pageNum?: number;
  pageSize?: number;
  [key: string]: unknown;
};

type SearchResponse = {
  data?: unknown[];
  items?: unknown[];
  content?: unknown[];
  list?: unknown[];
};

type VoucherSearchApiPayload = {
  searchCondition: {
    keyword: string;
    code: string;
    franchise_id: string | null;
    franchiseId?: string | null;
    type: VoucherType | "";
    is_active: boolean | "";
    is_deleted: boolean;
  };
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
};

const DEFAULT_SEARCH_PAYLOAD: VoucherSearchApiPayload = {
  searchCondition: {
    keyword: "",
    code: "",
    franchise_id: null,
    type: "",
    is_active: "",
    is_deleted: false,
  },
  pageInfo: {
    pageNum: 1,
    pageSize: 20,
  },
};

function buildSearchPayload(
  payload: VoucherSearchPayload = {},
): VoucherSearchApiPayload {
  if ((payload as any).searchCondition && (payload as any).pageInfo) {
    return payload as unknown as VoucherSearchApiPayload;
  }

  return {
    searchCondition: {
      keyword: typeof payload.keyword === "string" ? payload.keyword : "",
      code: typeof payload.code === "string" ? payload.code : "",
      franchise_id:
        typeof payload.franchiseId === "string" ? payload.franchiseId : null,
      franchiseId:
        typeof payload.franchiseId === "string" ? payload.franchiseId : null,
      type:
        payload.type === "PERCENT" || payload.type === "FIXED"
          ? payload.type
          : "",
      is_active:
        typeof payload.isActive === "boolean" ? payload.isActive : "",
      is_deleted:
        typeof payload.isDeleted === "boolean"
          ? payload.isDeleted
          : DEFAULT_SEARCH_PAYLOAD.searchCondition.is_deleted,
    },
    pageInfo: {
      pageNum:
        typeof payload.pageNum === "number"
          ? payload.pageNum
          : DEFAULT_SEARCH_PAYLOAD.pageInfo.pageNum,
      pageSize:
        typeof payload.pageSize === "number"
          ? payload.pageSize
          : DEFAULT_SEARCH_PAYLOAD.pageInfo.pageSize,
    },
  };
}

/**
 * VOUCHER-01: Tạo voucher mới
 * POST /api/vouchers
 */
export async function createVoucher(
  payload: VoucherCreatePayload,
): Promise<Voucher> {
  const apiPayload = {
    code: payload.code,
    franchise_id: payload.franchiseId,
    product_franchise_id: payload.productFranchiseId ?? null,
    name: payload.name,
    description: payload.description ?? "",
    type: payload.type,
    value: payload.value,
    quota_total: payload.quotaTotal ?? 0,
    start_date: payload.startTime,
    end_date: payload.endTime,
    is_active: payload.isActive ?? true,
    created_by: payload.createdBy,
  };
  const { data } = await axiosAdminClient.post<Record<string, unknown>>(BASE, apiPayload);
  return toVoucher(unwrapPayload(data));
}

/**
 * VOUCHER-02: Tìm kiếm voucher theo điều kiện
 * POST /api/vouchers/search
 */
export async function searchVouchers(
  payload: VoucherSearchPayload = {},
): Promise<Voucher[]> {
  const { data } = await axiosAdminClient.post<SearchResponse>(
    `${BASE}/search`,
    buildSearchPayload(payload),
  );
  const root = data as any;
  const list: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(root?.data)
      ? root.data
      : Array.isArray(root?.items)
        ? root.items
        : Array.isArray(root?.content)
          ? root.content
          : Array.isArray(root?.list)
            ? root.list
            : Array.isArray(root?.data?.items)
              ? root.data.items
              : Array.isArray(root?.data?.content)
                ? root.data.content
                : Array.isArray(root?.data?.list)
                  ? root.data.list
                  : [];
  return list.map((item: unknown) =>
    toVoucher(item as Record<string, unknown>),
  );
}

/**
 * VOUCHER-03: Lấy chi tiết 1 voucher
 * GET /api/vouchers/:id
 */
export async function getVoucher(id: string): Promise<Voucher> {
  const { data } = await axiosAdminClient.get<Record<string, unknown>>(
    `${BASE}/${id}`,
  );
  return toVoucher(unwrapPayload(data));
}

/**
 * VOUCHER-04: Cập nhật voucher
 * PUT /api/vouchers/:id
 */
export async function updateVoucher(
  id: string,
  payload: VoucherUpdatePayload,
): Promise<Voucher> {
  const apiPayload: Record<string, unknown> = {};
  if (payload.code != null) apiPayload.code = payload.code;
  if (payload.franchiseId != null) apiPayload.franchise_id = payload.franchiseId;
  if ("productFranchiseId" in payload)
    apiPayload.product_franchise_id = payload.productFranchiseId ?? null;
  if (payload.name != null) apiPayload.name = payload.name;
  if ("description" in payload) apiPayload.description = payload.description ?? "";
  if (payload.type != null) apiPayload.type = payload.type;
  if (payload.value != null) apiPayload.value = payload.value;
  if (payload.quotaTotal != null) apiPayload.quota_total = payload.quotaTotal;
  if (payload.startTime != null) apiPayload.start_date = payload.startTime;
  if (payload.endTime != null) apiPayload.end_date = payload.endTime;
  if (payload.isActive != null) apiPayload.is_active = payload.isActive;

  const { data } = await axiosAdminClient.put<Record<string, unknown>>(
    `${BASE}/${id}`,
    apiPayload,
  );
  return toVoucher(unwrapPayload(data));
}

/**
 * VOUCHER-05: Xóa voucher (soft delete)
 * DELETE /api/vouchers/:id
 */
export async function deleteVoucher(id: string): Promise<void> {
  await axiosAdminClient.delete(`${BASE}/${id}`);
}

/**
 * VOUCHER-06: Khôi phục voucher đã xóa
 * PATCH /api/vouchers/:id/restore
 */
export async function restoreVoucher(id: string): Promise<Voucher> {
  const { data } = await axiosAdminClient.patch<Record<string, unknown>>(
    `${BASE}/${id}/restore`,
    {},
  );
  return toVoucher(unwrapPayload(data));
}


export async function changeVoucherStatus(
  id: string,
  isActive: boolean,
): Promise<Voucher> {
  const { data } = await axiosAdminClient.patch<Record<string, unknown>>(
    `${BASE}/${id}/status`,
    { is_active: isActive, isActive },
  );
  return toVoucher(unwrapPayload(data));
}
