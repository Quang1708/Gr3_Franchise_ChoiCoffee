import { axiosClient } from "@/api/axios.config";

/**
 * Customer Logout
 * POST /api/customer-auth/logout
 */
export const customerLogout = async (): Promise<void> => {
  await axiosClient.post("/api/customer-auth/logout");
};
