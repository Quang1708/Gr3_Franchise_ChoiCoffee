import { productApi } from "@/api";
import type { Product } from "@/models/product.model";

export type ServiceResult = { ok: true } | { ok: false; message: string };
export type ProductId = number | string;

export type ProductListItem = Product;

export type CreateProductPayload = {
  SKU: string;
  name: string;
  img?: string;
  description?: string;
  content?: string;
  minPrice: number;
  maxPrice: number;
  isActive?: boolean;
};

export type UpdateProductPayload = Partial<CreateProductPayload>;

export type ProductMutationResult =
  | { ok: true; product: ProductListItem }
  | { ok: false; message: string };

type ApiErrorLike = {
  response?: { data?: unknown; status?: number };
  statusCode?: number;
  message?: unknown;
  error?: unknown;
  data?: unknown;
};

const stringifyUnknown = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return `${value}`;
  if (Array.isArray(value)) {
    return value.map(stringifyUnknown).filter(Boolean).join(", ");
  }
  if (value && typeof value === "object") {
    try {
      const json = JSON.stringify(value);
      if (json && json !== "{}") return json;
    } catch {
      // ignore
    }
  }
  return "";
};

const getErrorMessage = (err: unknown, fallback: string) => {
  if (!err) return fallback;
  if (typeof err === "string") return err;

  const e = err as ApiErrorLike;
  const fromAxios = (e.response as { data?: unknown } | undefined)?.data;

  const candidates: unknown[] = [
    (fromAxios as { message?: unknown } | undefined)?.message,
    (fromAxios as { error?: unknown } | undefined)?.error,
    e.message,
    (e.data as { message?: unknown } | undefined)?.message,
    (e.data as { error?: unknown } | undefined)?.error,
    e.error,
  ];

  for (const c of candidates) {
    const str = stringifyUnknown(c);
    if (str) return str;
  }

  if (err instanceof Error && err.message) return err.message;
  return fallback;
};

const isRetryableBadRequest = (err: unknown): boolean => {
  if (!err || typeof err !== "object") return false;
  const e = err as ApiErrorLike;
  const status = e.statusCode ?? e.response?.status;
  if (status === 400) return true;
  if (e.error === "Bad Request") return true;
  if (Array.isArray(e.message)) return true;
  const msg = getErrorMessage(err, "").toLowerCase();
  return msg.includes("bad request") || msg.includes("validation");
};

const toSafeString = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return `${value}`;
  }
  return fallback;
};

const toSafeBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true" || v === "1" || v === "active") return true;
    if (v === "false" || v === "0" || v === "inactive") return false;
  }
  return fallback;
};

const toSafeNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

function mapProductRecord(raw: unknown): ProductListItem {
  const product = raw as Record<string, unknown>;

  const rawId =
    product.id ??
    product._id ??
    product.productId ??
    product.product_id ??
    product.productID;

  const rawSku =
    product.SKU ?? product.sku ?? product.product_sku ?? product.productSku;

  const rawImg =
    (product.img as string | undefined) ??
    (product.image as string | undefined) ??
    (product.image_url as string | undefined) ??
    (product.img_url as string | undefined) ??
    undefined;

  return {
    id: toSafeNumber(rawId, 0),
    SKU: toSafeString(rawSku),
    name: toSafeString(product.name),
    description: toSafeString(product.description, "") || undefined,
    content: toSafeString(product.content, "") || undefined,
    img: rawImg,
    minPrice: toSafeNumber(product.minPrice ?? product.min_price, 0),
    maxPrice: toSafeNumber(product.maxPrice ?? product.max_price, 0),
    isActive: toSafeBoolean(product.isActive ?? product.is_active, true),
    isDeleted: toSafeBoolean(product.isDeleted ?? product.is_deleted, false),
    createdAt: toSafeString(
      product.createdAt ?? product.created_at,
      new Date().toISOString(),
    ),
    updatedAt: toSafeString(
      product.updatedAt ?? product.updated_at,
      new Date().toISOString(),
    ),
  };
}

function extractArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const data = payload as {
    data?: unknown;
    items?: unknown;
    rows?: unknown;
  };

  if (Array.isArray(data.data)) return data.data;
  if (data.data && typeof data.data === "object") {
    const nested = data.data as { items?: unknown; rows?: unknown };
    if (Array.isArray(nested.items)) return nested.items;
    if (Array.isArray(nested.rows)) return nested.rows;
  }

  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.rows)) return data.rows;

  return [];
}

export async function getProducts(): Promise<ProductListItem[]> {
  try {
    const data = await productApi.getAll();
    const items = extractArray(data);
    if (items.length > 0) return items.map(mapProductRecord);
  } catch {
    void 0;
  }

  try {
    const data = await productApi.search({ keyword: "", page: 1, limit: 200 });
    return extractArray(data).map(mapProductRecord);
  } catch {
    return [];
  }
}

export async function createProduct(
  payload: CreateProductPayload,
): Promise<ProductMutationResult> {
  try {
    const sku = toSafeString(payload.SKU).trim();
    const name = toSafeString(payload.name).trim();
    const description = toSafeString(payload.description, "").trim() || undefined;
    const content = toSafeString(payload.content, "").trim() || undefined;
    const img = toSafeString(payload.img, "").trim() || undefined;
    const minPrice = toSafeNumber(payload.minPrice, 0);
    const maxPrice = toSafeNumber(payload.maxPrice, 0);

    const cleanPayload = (value: Record<string, unknown>) => {
      const cleaned: Record<string, unknown> = {};
      Object.keys(value).forEach((key) => {
        const v = value[key];
        if (v !== undefined && v !== "") {
          cleaned[key] = v;
        }
      });
      return cleaned;
    };

    // Backend contract (as provided):
    // SKU, name, description, content, image_url, images_url, min_price, max_price
    // Some environments validate strictly (reject unknown fields) => keep payload minimal.
    const strictContract = cleanPayload({
      SKU: sku,
      name,
      description,
      content,
      image_url: img,
      images_url: img ? [img] : undefined,
      min_price: minPrice,
      max_price: maxPrice,
    });

    const candidates: Array<Record<string, unknown>> = [
      strictContract,
      cleanPayload({ ...strictContract, images_url: img }),
      cleanPayload({ ...strictContract, images_url: img ? [img] : undefined, image_url: undefined, img }),
      cleanPayload({ data: strictContract }),
      cleanPayload({ product: strictContract }),
    ];

    let data: unknown;
    let lastErr: unknown;
    for (const body of candidates) {
      try {
        data = await productApi.create(body);
        lastErr = undefined;
        break;
      } catch (err: unknown) {
        lastErr = err;
        if (!isRetryableBadRequest(err)) break;
      }
    }

    if (data === undefined) {
      throw lastErr;
    }

    const raw = (data as { data?: unknown })?.data ?? data;
    return { ok: true, product: mapProductRecord(raw) };
  } catch (err: unknown) {
    return {
      ok: false,
      message: getErrorMessage(err, "Thêm sản phẩm thất bại"),
    };
  }
}

export async function updateProduct(
  productId: number | string,
  payload: UpdateProductPayload,
): Promise<ProductMutationResult> {
  try {
    const apiPayload: Record<string, unknown> = {};
    if (payload.SKU !== undefined) apiPayload.sku = payload.SKU;
    if (payload.name !== undefined) apiPayload.name = payload.name;
    if (payload.img !== undefined) apiPayload.img = payload.img;
    if (payload.description !== undefined) apiPayload.description = payload.description;
    if (payload.content !== undefined) apiPayload.content = payload.content;
    if (payload.minPrice !== undefined) apiPayload.min_price = payload.minPrice;
    if (payload.maxPrice !== undefined) apiPayload.max_price = payload.maxPrice;
    if (payload.isActive !== undefined) apiPayload.is_active = payload.isActive;

    let data: unknown;
    try {
      data = await productApi.update(productId, apiPayload);
    } catch (err: unknown) {
      if (isRetryableBadRequest(err) && payload.SKU !== undefined) {
        const altPayload = { ...apiPayload };
        delete altPayload.sku;
        altPayload.SKU = payload.SKU;
        data = await productApi.update(productId, altPayload);
      } else {
        throw err;
      }
    }
    const raw = (data as { data?: unknown })?.data ?? data;
    const merged = {
      id: productId,
      ...(isRecord(raw) ? raw : {}),
    };
    return { ok: true, product: mapProductRecord(merged) };
  } catch (err: unknown) {
    return {
      ok: false,
      message: getErrorMessage(err, "Cập nhật sản phẩm thất bại"),
    };
  }
}

export async function deleteProduct(productId: ProductId): Promise<ServiceResult> {
  try {
    await productApi.remove(productId);
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, message: getErrorMessage(err, "Xóa sản phẩm thất bại") };
  }
}

export async function restoreProduct(
  productId: ProductId,
): Promise<ServiceResult> {
  try {
    await productApi.restore(productId);
    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      message: getErrorMessage(err, "Khôi phục sản phẩm thất bại"),
    };
  }
}
