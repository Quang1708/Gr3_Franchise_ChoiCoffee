/**
 * Customer Profile Information
 */
export interface CustomerProfile {
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

/**
 * Update Customer Profile Request
 */
export interface UpdateCustomerProfileRequest {
  email: string;
  name?: string;
  phone: string;
  address?: string;
  avatar_url?: string;
}

/**
 * Change Password Request
 */
export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

/**
 * Customer Profile Response
 */
export interface CustomerProfileResponse {
  success: boolean;
  data: CustomerProfile;
}

/**
 * Customer Authentication Profile (simplified for auth and UI)
 */
export interface CustomerAuthProfile {
  id: string;
  email?: string;
  phone: string;
  name: string;
  avatar_url?: string;
  address?: string;
}
