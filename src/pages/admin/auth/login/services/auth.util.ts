export type AdminAuthResult = {
  success: boolean;
  message?: string;
  errors?: Array<{ field?: string; message: string }>;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T | null;
  message?: string | null;
  errors?: Array<{ field?: string; message: string }>;
};

export const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null) {
    const directMessage = (error as { message?: string }).message;
    if (directMessage) return directMessage;
    const directErrors = (error as { errors?: Array<{ message?: string }> })
      .errors;
    if (directErrors?.length) {
      const first = directErrors.find((e) => e?.message)?.message;
      if (first) return first;
    }
    const message = (error as { response?: { data?: { message?: string } } })
      .response?.data?.message;
    if (message) return message;
    const responseErrors = (
      error as {
        response?: {
          data?: { errors?: Array<{ message?: string }> };
        };
      }
    ).response?.data?.errors;
    if (responseErrors?.length) {
      const first = responseErrors.find((e) => e?.message)?.message;
      if (first) return first;
    }
  }
  return "Có lỗi xảy ra. Vui lòng thử lại.";
};
