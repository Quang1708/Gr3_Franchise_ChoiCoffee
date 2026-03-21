import { ENV } from "@/config";
import type { ApiErrorResponse } from "@/models";
import { useCustomerAuthStore } from "@/stores/customerAuth.store";
import { useAuthStore } from "@/stores/auth.store";
import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

// Message constants for token expiration
export const MSG_CONSTANT = {
  CUSTOMER_ACCESS_TOKEN_EXPIRED: "CUSTOMER_ACCESS_TOKEN_EXPIRED",
  ADMIN_ACCESS_TOKEN_EXPIRED: "Access token has expired",
};

export const axiosClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 300000,
  withCredentials: true,
});

// Track if we're currently refreshing token
let isRefreshing = false;
// Queue of requests waiting for token refresh
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Response interceptor to handle token refresh
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const errorData = error.response?.data as ApiErrorResponse | undefined;
    const errorMessage =
      errorData?.message ?? (error as { message?: string }).message;
    const isAccessTokenExpired =
      errorMessage === MSG_CONSTANT.CUSTOMER_ACCESS_TOKEN_EXPIRED;

    if (isAccessTokenExpired && !originalRequest._retry) {
      if (originalRequest.url?.includes("/refresh-token")) {
        useCustomerAuthStore.getState().clearCustomer();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosClient.get("/api/customer-auth/refresh-token");

        processQueue();
        isRefreshing = false;

        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        isRefreshing = false;
        useCustomerAuthStore.getState().clearCustomer();
        return Promise.reject(refreshError);
      }
    }
    console.log(error.message);
    return Promise.reject(error.response?.data);
  },
);

// Admin axios instance with separate refresh token handling
export const axiosAdminClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 300000,
  withCredentials: true,
});



axiosAdminClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token && token !== "SESSION") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Track if we're currently refreshing admin token
let isRefreshingAdmin = false;
// Queue of admin requests waiting for token refresh
let failedAdminQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processAdminQueue = (error: AxiosError | null = null) => {
  failedAdminQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedAdminQueue = [];
};

// Response interceptor for admin to handle token refresh
axiosAdminClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if error response contains ACCESS_TOKEN_EXPIRED message or HTTP 401
    const errorData = error.response?.data as ApiErrorResponse | undefined;
    const errorMessage =
      errorData?.message ?? (error as { message?: string }).message;
    const isAccessTokenExpired =
      errorMessage === MSG_CONSTANT.ADMIN_ACCESS_TOKEN_EXPIRED;
    const is401 = error.response?.status === 401;

    // If access token expired (by message or 401 status) and we haven't retried yet
    if ((isAccessTokenExpired || is401) && !originalRequest._retry) {
      // Don't retry refresh token endpoint itself
      if (originalRequest.url?.includes("/refresh-token")) {
        // Refresh token expired, clear admin info and redirect to login
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      if (isRefreshingAdmin) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedAdminQueue.push({ resolve, reject });
        })
          .then(() => axiosAdminClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshingAdmin = true;

      try {
        // Call admin refresh token API
        await axiosAdminClient.get("/api/auth/refresh-token");

        // Token refreshed successfully, process queued requests
        processAdminQueue();
        isRefreshingAdmin = false;

        // Retry original request
        return axiosAdminClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth (component will handle navigation)
        processAdminQueue(refreshError as AxiosError);
        isRefreshingAdmin = false;
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error.response?.data);
  },
);
