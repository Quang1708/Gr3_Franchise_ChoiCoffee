import { AxiosError } from "axios";

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error.response?.data as any)?.message ||
      "Có lỗi từ hệ thống."
    );
  }
  return "Đã xảy ra lỗi không xác định.";
};