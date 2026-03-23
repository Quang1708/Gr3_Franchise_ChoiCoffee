import { toast } from "react-toastify";

export const handleApiError = (err: any) => {
  if (!err) {
    toast.error("Unknown error");
    return;
  }

  // 1. Nếu BE trả message
  if (err.message) {
    toast.error(err.message);
  }

  // 2. Nếu có list errors (validation)
  if (Array.isArray(err.errors) && err.errors.length > 0) {
    err.errors.forEach((e: any) => {
      toast.error(e.message || JSON.stringify(e));
    });
  }
};