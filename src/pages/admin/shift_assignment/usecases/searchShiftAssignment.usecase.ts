import type { ShiftAssignmentSearchPayload } from "../models/shiftAssignment.model";
import { shiftAssignment03Service } from "../services";
import {
  extractArray,
  toRow,
  getAssignedByDisplayName,
} from "../utils/shiftAssignment.helpers";
import { userApi } from "@/api/user/user.api";

type SearchShiftAssignmentResult = {
  items: ReturnType<typeof toRow>[];
  pageInfo: {
    pageNum: number;
    pageSize: number;
    totalItems: number;
  };
};

const extractPageInfo = (
  payload: unknown,
  fallbackPageNum: number,
  fallbackPageSize: number,
  fallbackTotalItems: number,
) => {
  if (!payload || typeof payload !== "object") {
    return {
      pageNum: fallbackPageNum,
      pageSize: fallbackPageSize,
      totalItems: fallbackTotalItems,
    };
  }

  const root = payload as {
    pageInfo?: {
      pageNum?: number;
      pageSize?: number;
      totalItems?: number;
    };
    data?: {
      pageInfo?: {
        pageNum?: number;
        pageSize?: number;
        totalItems?: number;
      };
      totalItems?: number;
      total?: number;
      count?: number;
    };
    totalItems?: number;
    total?: number;
    count?: number;
  };

  const nestedPageInfo = root.data?.pageInfo;
  const pageInfo = root.pageInfo ?? nestedPageInfo;

  return {
    pageNum: pageInfo?.pageNum ?? fallbackPageNum,
    pageSize: pageInfo?.pageSize ?? fallbackPageSize,
    totalItems:
      pageInfo?.totalItems ??
      root.totalItems ??
      root.data?.totalItems ??
      root.total ??
      root.data?.total ??
      root.count ??
      root.data?.count ??
      fallbackTotalItems,
  };
};

export const searchShiftAssignment = async (
  payload: ShiftAssignmentSearchPayload,
): Promise<SearchShiftAssignmentResult> => {
  const res = await shiftAssignment03Service(payload);
  const items = extractArray(res).map(toRow);
  const fallbackPageNum = payload.pageInfo?.pageNum ?? 1;
  const fallbackPageSize = payload.pageInfo?.pageSize ?? items.length;
  const pageInfo = extractPageInfo(
    res,
    fallbackPageNum,
    fallbackPageSize,
    items.length,
  );

  // Fetch assigned_by names for items that don't have them
  const missingIds = [
    ...new Set(
      items
        .filter((entry) => entry.assigned_by && !entry.assigned_by_name)
        .map((entry) => entry.assigned_by!),
    ),
  ];

  if (missingIds.length > 0) {
    const nameMap: Record<string, string> = {};

    await Promise.allSettled(
      missingIds.map(async (id) => {
        try {
          const response = (await userApi.getById(id)) as Record<
            string,
            unknown
          >;
          nameMap[id] = getAssignedByDisplayName(response, id);
        } catch {
          /* ignore */
        }
      }),
    );

    const enrichedItems = items.map((entry) => ({
      ...entry,
      assigned_by_name: entry.assigned_by
        ? (nameMap[entry.assigned_by] ?? entry.assigned_by)
        : undefined,
    }));

    return { items: enrichedItems, pageInfo };
  }

  return { items, pageInfo };
};
