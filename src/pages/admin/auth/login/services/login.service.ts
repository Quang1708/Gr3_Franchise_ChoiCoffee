import { axiosAdminClient } from "@/api/axios.config";
import { LOCAL_STORAGE } from "@/consts/localstorage.const";
import { getItemInLocalStorage } from "@/utils/localStorage.util";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminProfileResponse,
} from "../models/api.model";

type SwitchContextPayload = {
  franchise_id: string | number | null;
};

export const loginAdmin = async (
  payload: AdminLoginRequest,
): Promise<AdminLoginResponse> => {
  const { data } = await axiosAdminClient.post<AdminLoginResponse>(
    "/api/auth",
    payload,
  );
  return data;
};

export const getAdminProfile = async (): Promise<AdminProfileResponse> => {
  const token = getItemInLocalStorage<string>(LOCAL_STORAGE.CMS_TOKEN);
  const authToken = token && token !== "SESSION" ? token : null;
  const { data } = await axiosAdminClient.get<AdminProfileResponse>("/api/auth", {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
  });
  return data;
};

export const switchAdminContext = async (
  payload: SwitchContextPayload,
): Promise<void> => {
  const token = getItemInLocalStorage<string>(LOCAL_STORAGE.CMS_TOKEN);
  const authToken = token && token !== "SESSION" ? token : null;
  await axiosAdminClient.post("/api/auth/switch-context", payload, {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
  });
};
