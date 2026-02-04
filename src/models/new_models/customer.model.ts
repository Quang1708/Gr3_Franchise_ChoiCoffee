export interface Customer {
  id: number;
  phone: string;
  email?: string;
  passwordHash: string;
  name: string;
  avatarUrl?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LoyaltyTier = "Silver" | "Gold" | "Platinum";

export interface CustomerFranchise {
  id: number;
  customerId: number;
  franchiseId: number;
  loyaltyPoint: number;
  loyaltyTier: LoyaltyTier;
  firstOrderAt?: string;
  lastOrderAt?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LoyaltyTransactionType = "EARN" | "REDEEM" | "ADJUST";

export interface LoyaltyTransaction {
  id: number;
  customerFranchiseId: number;
  orderId: number;
  type: LoyaltyTransactionType;
  pointChange: number;
  reason: string;
  createdBy: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
