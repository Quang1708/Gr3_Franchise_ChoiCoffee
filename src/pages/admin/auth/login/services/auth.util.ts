export type AdminAuthResult = {
  success: boolean;
  message?: string;
};

export const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null) {
    const directMessage = (error as { message?: string }).message;
    if (directMessage) return directMessage;
    const message = (error as { response?: { data?: { message?: string } } })
      .response?.data?.message;
    if (message) return message;
  }
  return "Có lỗi xảy ra. Vui lòng thử lại.";
};
