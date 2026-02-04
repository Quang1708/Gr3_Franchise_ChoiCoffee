import type {
  Customer,
  CustomerFranchise,
  LoyaltyTransaction,
} from "../../models/new_models/customer.model";

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 1,
    phone: "0900000001",
    email: "customer1@example.com",
    passwordHash: "hash1",
    name: "Nguyen Van A",
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    phone: "0900000002",
    email: "customer2@example.com",
    passwordHash: "hash2",
    name: "Tran Thi B",
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-02T00:00:00Z",
    updatedAt: "2023-01-02T00:00:00Z",
  },
];

export const MOCK_CUSTOMER_FRANCHISES: CustomerFranchise[] = [
  {
    id: 1,
    customerId: 1,
    franchiseId: 1,
    loyaltyPoint: 100,
    loyaltyTier: "Silver",
    firstOrderAt: "2023-01-10T10:00:00Z",
    lastOrderAt: "2023-01-20T10:00:00Z",
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-10T00:00:00Z",
    updatedAt: "2023-01-10T00:00:00Z",
  },
];

export const MOCK_LOYALTY_TRANSACTIONS: LoyaltyTransaction[] = [
  {
    id: 1,
    customerFranchiseId: 1,
    orderId: 1,
    type: "EARN",
    pointChange: 10,
    reason: "Order reward",
    createdBy: 3, // Staff
    isDeleted: false,
    createdAt: "2023-01-10T10:00:00Z",
    updatedAt: "2023-01-10T10:00:00Z",
  },
];
