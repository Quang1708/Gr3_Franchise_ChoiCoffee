import type { Promotion } from "../../models/new_models/promotion.model";

export const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: 1,
    franchiseId: 1,
    productFranchiseId: undefined, // Whole store
    type: "PERCENT",
    value: 10, // 10% off
    startTime: "2023-01-01T00:00:00Z",
    endTime: "2023-12-31T23:59:59Z",
    createdBy: 2, // Manager
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
];
