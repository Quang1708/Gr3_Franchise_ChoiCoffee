import type {
  CustomerLoyalty,
  FranchiseLoyaltyRule,
} from "../models/loyaltyClient.model";
import {
  getCustomerLoyaltyByFranchise,
  getFranchiseLoyaltyRule,
} from "../service/loyaltyClient.service";

export interface LoyaltyOverview {
  loyaltyRule: FranchiseLoyaltyRule | null;
  customerLoyalty: CustomerLoyalty | null;
}

export const getLoyaltyOverviewUsecase = async (
  franchiseId: string,
): Promise<LoyaltyOverview> => {
  const [loyaltyRule, customerLoyalty] = await Promise.all([
    getFranchiseLoyaltyRule(franchiseId),
    getCustomerLoyaltyByFranchise(franchiseId),
  ]);

  return {
    loyaltyRule,
    customerLoyalty,
  };
};
