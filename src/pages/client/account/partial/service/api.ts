import { axiosClient } from "@/api/axios.config";

// ========== Request/Response Types ==========

export interface CustomerInfo {
  id: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  email: string;
  name: string;
  phone: string;
  avatar_url: string;
  address: string;
  is_verified: boolean;
}

export interface CustomerInfoResponse {
  success: boolean;
  data: CustomerInfo;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface UpdateCustomerProfileRequest {
  email: string;
  name: string;
  phone: string;
  address: string;
  avatar_url: string;
}

// ========== API Functions ==========

/**
 * Get Customer Information
 * GET /api/customer-auth
 */
export const getCustomerInfo = async (): Promise<CustomerInfo> => {
  const { data } =
    await axiosClient.get<CustomerInfoResponse>("/api/customer-auth");
  return data.data;
};

/**
 * Change Password
 * PUT /api/customer-auth/change-password
 */
export const changePassword = async (
  request: ChangePasswordRequest,
): Promise<void> => {
  await axiosClient.put("/api/customer-auth/change-password", request);
};

/**
 * Update Customer Profile
 * PUT /api/customers/:id
 */
export const updateCustomerProfile = async (
  customerId: string,
  request: UpdateCustomerProfileRequest,
): Promise<void> => {
  await axiosClient.put(`/api/customers/${customerId}`, request);
};
