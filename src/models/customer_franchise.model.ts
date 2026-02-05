export interface CustomerFranchise {
    id: number;
    customerId: number;
    franchiseId: number;
    loyaltyPoint: number;
    loyaltyTier: 'Silver' | 'Gold' | 'Platinum';
    firstOrderAt?: string;
    lastOrderAt?: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}