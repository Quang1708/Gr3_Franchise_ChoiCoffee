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
