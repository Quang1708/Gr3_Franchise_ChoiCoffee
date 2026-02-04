import type {
  Order,
  OrderItem,
  OrderStatusLog,
} from "../../models/new_models/order.model";

export const MOCK_ORDERS: Order[] = [
  {
    id: 1,
    code: "ORD-001",
    franchiseId: 1,
    customerId: 1,
    type: "ONLINE",
    status: "COMPLETED",
    totalAmount: 33000,
    confirmedAt: "2023-01-10T10:05:00Z",
    completedAt: "2023-01-10T10:30:00Z",
    isDeleted: false,
    createdAt: "2023-01-10T10:00:00Z",
    updatedAt: "2023-01-10T10:30:00Z",
  },
];

export const MOCK_ORDER_ITEMS: OrderItem[] = [
  {
    id: 1,
    orderId: 1,
    productFranchiseId: 1, // Black Coffee
    productNameSnapshot: "Black Coffee",
    priceSnapshot: 15000,
    quantity: 1,
    lineTotal: 15000,
    isDeleted: false,
    createdAt: "2023-01-10T10:00:00Z",
    updatedAt: "2023-01-10T10:00:00Z",
  },
  {
    id: 2,
    orderId: 1,
    productFranchiseId: 2, // Milk Coffee
    productNameSnapshot: "Milk Coffee",
    priceSnapshot: 18000,
    quantity: 1,
    lineTotal: 18000,
    isDeleted: false,
    createdAt: "2023-01-10T10:00:00Z",
    updatedAt: "2023-01-10T10:00:00Z",
  },
];

export const MOCK_ORDER_STATUS_LOGS: OrderStatusLog[] = [
  {
    id: 1,
    orderId: 1,
    fromStatus: "DRAFT",
    toStatus: "CONFIRMED",
    changedBy: 1, // System or Customer? Usually system for online, or staff. Let's say Staff 3 confirmed it.
    note: "Order received",
    createdAt: "2023-01-10T10:05:00Z",
    updatedAt: "2023-01-10T10:05:00Z",
  },
];
