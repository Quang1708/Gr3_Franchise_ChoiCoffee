import type { Franchise } from "../../models/new_models/franchise.model";

export const MOCK_FRANCHISES: Franchise[] = [
  {
    id: 1,
    code: "FC001",
    name: "Choi Coffee - Central",
    address: "123 Main St, City Center",
    openedAt: "07:00:00",
    closedAt: "22:00:00",
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    code: "FC002",
    name: "Choi Coffee - Westside",
    address: "456 West Ave, West District",
    openedAt: "08:00:00",
    closedAt: "21:00:00",
    isActive: true,
    isDeleted: false,
    createdAt: "2023-02-15T00:00:00Z",
    updatedAt: "2023-02-15T00:00:00Z",
  },
];
