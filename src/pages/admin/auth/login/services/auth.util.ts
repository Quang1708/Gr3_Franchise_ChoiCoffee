export type AdminAuthResult = {
  success: boolean;
  message?: string;
};

export const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null) {
    const message = (error as { response?: { data?: { message?: string } } })
      .response?.data?.message;
    if (message) return message;
  }
  return "Co loi xay ra, vui long thu lai sau.";
};
