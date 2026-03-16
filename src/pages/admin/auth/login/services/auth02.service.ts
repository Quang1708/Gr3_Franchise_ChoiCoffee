import { axiosAdminClient } from "@/api/axios.config";

type SwitchContextPayload = {
  franchise_id: string | null;
};

export type SwitchContextResponse = {
  success: boolean;
  data: { token?: string } | null;
  message?: string | null;
  errors?: Array<{ field?: string; message: string }>;
};

export const switchAdminContext = async (
  payload: SwitchContextPayload,
): Promise<SwitchContextResponse> => {
  const { data } = await axiosAdminClient.post<SwitchContextResponse>(
    "/api/auth/switch-context",
    payload,
  );
  return data;
};
