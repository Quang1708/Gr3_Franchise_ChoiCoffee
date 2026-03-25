import { axiosClient } from "@/api";
import type {
  ApiResponse,
  CustomerLoyalty,
  FranchiseLoyaltyRule,
} from "../models/loyaltyClient.model";

export const getFranchiseLoyaltyRule = async (
  franchiseId: string,
): Promise<FranchiseLoyaltyRule | null> => {
  if (!franchiseId.trim()) return null;

  const response = await axiosClient.get<ApiResponse<FranchiseLoyaltyRule>>(
    `/api/clients/franchises/${franchiseId}/loyalty-rule`,
  );
  return response.data?.data ?? null;
};

export const getCustomerLoyaltyByFranchise = async (
  franchiseId: string,
): Promise<CustomerLoyalty | null> => {
  if (!franchiseId.trim()) return null;

  const response = await axiosClient.get<ApiResponse<CustomerLoyalty>>(
    `/api/clients/franchises/${franchiseId}/customer-loyalty`,
  );
  return response.data?.data ?? null;
};
