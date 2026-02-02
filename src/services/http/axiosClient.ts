import axios from "axios";
import { LOCAL_STORAGE } from "../../consts/localstorage.const";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  timeout: 15000,
});

axiosClient.interceptors.request.use((config) => {
  const tokenRaw = localStorage.getItem(LOCAL_STORAGE.ADMIN_TOKEN);
  const token = tokenRaw ? JSON.parse(tokenRaw) : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem(LOCAL_STORAGE.ADMIN_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE.ACCOUNT_ADMIN);
      window.location.href = "/admin/login";
    }
    return Promise.reject(err);
  }
);
