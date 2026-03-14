import { axiosAdminClient } from "@/api";


export const logoutApi = () => {
  return axiosAdminClient.post("/api/auth/logout");
};