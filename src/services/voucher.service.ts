import { axiosAdminClient } from "@/api/axios.config";
import type { Voucher, VoucherType } from "@/models/voucher.model";
import { VOUCHER_SEED_DATA } from "@/mocks/voucher.seed";

const BASE = "/api/vouchers";

/** Khi không có backend hoặc bật mock → dùng dữ liệu giả để dev UI */
const USE_MOCK_VOUCHER =
  !import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_MOCK_VOUCHER_API === "true";

/** Chuẩn hóa 1 item từ API (snake_case hoặc camelCase) sang Voucher */
function toVoucher(raw: Record<string, unknown>): Voucher {
  const id = Number(raw.id ?? raw.ID ?? 0);
  const code = String(raw.code ?? "");
  const franchiseId = Number(raw.franchiseId ?? raw.franchise_id ?? 0);
  const pf = raw.productFranchiseId ?? raw.product_franchise_id;
  const productFranchiseId = pf == null ? null : Number(pf);
  const name = String(raw.name ?? "");
  const description = String(raw.description ?? "");
  const type = String(raw.type ?? "PERCENT").toUpperCase() as VoucherType;
  const value = Number(raw.value ?? 0);
  const quotaTotal = Number(raw.quotaTotal ?? raw.quota_total ?? 0);
  const quotaUsed = Number(raw.quotaUsed ?? raw.quota_used ?? 0);
  const startTime = String(raw.startTime ?? raw.start_time ?? "");
  const endTime = String(raw.endTime ?? raw.end_time ?? "");
  const isActive = Boolean(raw.isActive ?? raw.is_active ?? true);
  const isDeleted = Boolean(raw.isDeleted ?? raw.is_deleted ?? false);
  const createdBy = Number(raw.createdBy ?? raw.created_by ?? 0);
  const createdAt = String(raw.createdAt ?? raw.created_at ?? "");
  const updatedAt = String(raw.updatedAt ?? raw.updated_at ?? "");

  return {
    id,
    code,
    franchiseId,
    productFranchiseId,
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

/** Body gửi lên khi tạo voucher (theo bảng voucher) */
export type VoucherCreatePayload = {
  code: string;
  franchiseId: number;
  productFranchiseId?: number | null;
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

/** Điều kiện tìm kiếm */
export type VoucherSearchPayload = {
  keyword?: string;
  code?: string;
  franchiseId?: number;
  isActive?: boolean;
  isDeleted?: boolean;
  pageNum?: number;
  pageSize?: number;
  [key: string]: unknown;
};

/** Response search (cấu trúc tùy backend) */
type SearchResponse = {
  data?: unknown[];
  items?: unknown[];
  content?: unknown[];
  list?: unknown[];
};

/**
 * VOUCHER-01: Tạo voucher mới
 * POST /api/vouchers
 */
export async function createVoucher(
  payload: VoucherCreatePayload,
): Promise<Voucher> {
  const { data } = await axiosAdminClient.post<Record<string, unknown>>(
    BASE,
    payload,
  );
  return toVoucher((data as Record<string, unknown>) ?? {});
}

/**
 * VOUCHER-02: Tìm kiếm voucher theo điều kiện
 * POST /api/vouchers/search
 */
export async function searchVouchers(
  payload: VoucherSearchPayload = {},
): Promise<Voucher[]> {
  if (USE_MOCK_VOUCHER) {
    await new Promise((r) => setTimeout(r, 300));
    let list = [...VOUCHER_SEED_DATA];
    if (payload.franchiseId != null) {
      list = list.filter((v) => v.franchiseId === payload.franchiseId);
    }
    if (payload.isDeleted === true) {
      list = list.filter((v) => v.isDeleted);
    } else if (payload.isDeleted === false) {
      list = list.filter((v) => !v.isDeleted);
    }
    if (payload.isActive === true) {
      list = list.filter((v) => v.isActive);
    } else if (payload.isActive === false) {
      list = list.filter((v) => !v.isActive);
    }
    if (payload.code != null && payload.code !== "") {
      list = list.filter(
        (v) =>
          v.code.toLowerCase().includes(String(payload.code).toLowerCase()),
      );
    }
    return list;
  }

  try {
    const { data } = await axiosAdminClient.post<SearchResponse>(
      `${BASE}/search`,
      payload,
    );
    const list =
      Array.isArray(data)
        ? data
        : (data?.data ?? data?.items ?? data?.content ?? data?.list ?? []);
    return list.map((item) => toVoucher(item as Record<string, unknown>));
  } catch (err) {
    console.warn("searchVouchers failed, falling back to mock data", err);
    await new Promise((r) => setTimeout(r, 200));
    let list = [...VOUCHER_SEED_DATA];
    if (payload.franchiseId != null) {
      list = list.filter((v) => v.franchiseId === payload.franchiseId);
    }
    return list;
  }
}

/**
 * VOUCHER-03: Lấy chi tiết 1 voucher
 * GET /api/vouchers/:id
 */
export async function getVoucher(id: number): Promise<Voucher> {
  const { data } = await axiosAdminClient.get<Record<string, unknown>>(
    `${BASE}/${id}`,
  );
  return toVoucher((data as Record<string, unknown>) ?? {});
}

/**
 * VOUCHER-04: Cập nhật voucher
 * PUT /api/vouchers/:id
 */
export async function updateVoucher(
  id: number,
  payload: VoucherUpdatePayload,
): Promise<Voucher> {
  const { data } = await axiosAdminClient.put<Record<string, unknown>>(
    `${BASE}/${id}`,
    payload,
  );
  return toVoucher((data as Record<string, unknown>) ?? {});
}

/**
 * VOUCHER-05: Xóa voucher (soft delete)
 * DELETE /api/vouchers/:id
 */
export async function deleteVoucher(id: number): Promise<void> {
  await axiosAdminClient.delete(`${BASE}/${id}`);
}

/**
 * VOUCHER-06: Khôi phục voucher đã xóa
 * PATCH /api/vouchers/:id/restore
 */
export async function restoreVoucher(id: number): Promise<Voucher> {
  const { data } = await axiosAdminClient.patch<Record<string, unknown>>(
    `${BASE}/${id}/restore`,
    {},
  );
  return toVoucher((data as Record<string, unknown>) ?? {});
}
