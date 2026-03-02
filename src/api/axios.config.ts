import { ENV } from "@/config";
import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

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

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry refresh token endpoint itself
      if (originalRequest.url?.includes("/refresh-token")) {
        // Refresh token expired, clear customer info and redirect to login
        localStorage.removeItem("customer_info");
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh token API
        await axiosClient.post("/api/customer-auth/refresh-token");

        // Token refreshed successfully, process queued requests
        processQueue();
        isRefreshing = false;

        // Retry original request
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth (component will handle navigation)
        processQueue(refreshError as AxiosError);
        isRefreshing = false;
        localStorage.removeItem("customer_info");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Admin axios instance with separate refresh token handling
export const axiosAdminClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 300000,
  withCredentials: true,
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

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry refresh token endpoint itself
      if (originalRequest.url?.includes("/refresh-token")) {
        // Refresh token expired, clear admin info and redirect to login
        localStorage.removeItem("admin_info");
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
        await axiosAdminClient.post("/api/auth/refresh-token");

        // Token refreshed successfully, process queued requests
        processAdminQueue();
        isRefreshingAdmin = false;

        // Retry original request
        return axiosAdminClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth (component will handle navigation)
        processAdminQueue(refreshError as AxiosError);
        isRefreshingAdmin = false;
        localStorage.removeItem("admin_info");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
