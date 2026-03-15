export interface CreateProductResponse<T> {
  success: boolean;
  data?: T;
  message?: string | null;
  errors?: {
    field: string;
    message: string;
  }[];
}
