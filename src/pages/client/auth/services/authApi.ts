import { axiosClient } from "@/api/axios.config";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface ResendTokenRequest {
  email: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
  avatar_url: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  name: string;
  phone: string;
  address: string;
  avatar_url: string;
  createdAt: string;
}

// ========== API Functions ==========

/*
 * Customer Login
 * POST /api/customer-auth
 */
export const customerLogin = async (
  credentials: LoginRequest,
): Promise<LoginResponse> => {
  const { data } = await axiosClient.post<LoginResponse>(
    "/api/customer-auth",
    credentials,
  );
  return data;
};

/*
 * Forgot Password
 * PUT /api/customer-auth/forgot-password
 */
export const forgotPassword = async (
  request: ForgotPasswordRequest,
): Promise<void> => {
  await axiosClient.put("/api/customer-auth/forgot-password", request);
};

/*
 * Verify Token
 * POST /api/customer-auth/verify-token
 */
export const verifyToken = async (
  request: VerifyTokenRequest,
): Promise<void> => {
  await axiosClient.post("/api/customer-auth/verify-token", request);
};

/*
 * Resend Token
 * POST /api/customer-auth/resend-token
 */
export const resendToken = async (
  request: ResendTokenRequest,
): Promise<void> => {
  await axiosClient.post("/api/customer-auth/resend-token", request);
};

/*
 * Customer Registration
 * POST /api/customers/register
 */
export const customerRegister = async (
  userData: RegisterRequest,
): Promise<RegisterResponse> => {
  const { data } = await axiosClient.post<RegisterResponse>(
    "/api/customers/register",
    userData,
  );
  return data;
};
/**
 * Customer Logout
 * POST /api/auth/logout
 */
export const customerLogout = async (): Promise<void> => {
  await axiosClient.post("/api/auth/logout");
};

/**
 * Refresh Token
 * POST /api/customer-auth/refresh-token
 */
export const refreshToken = async (): Promise<void> => {
  await axiosClient.post("/api/customer-auth/refresh-token");
};
