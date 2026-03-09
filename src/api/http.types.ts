import type { ApiFieldError } from "@/models";

export interface HttpRequestConfig<
  TData = unknown,
  TParams extends Record<string, unknown> = Record<string, unknown>,
> {
  url: string;
  data?: TData;
  params?: TParams;
  headers?: Record<string, string>;
}

export interface HttpClient {
  get<T, P extends Record<string, unknown> = Record<string, unknown>>(
    config: HttpRequestConfig<never, P>,
  ): Promise<T | null>;

  post<T, D = unknown>(config: HttpRequestConfig<D>): Promise<T | null>;

  put<T, D = unknown>(config: HttpRequestConfig<D>): Promise<T | null>;

  patch<T, D = unknown>(config: HttpRequestConfig<D>): Promise<T | null>;

  delete<T, P extends Record<string, unknown> = Record<string, unknown>>(
    config: HttpRequestConfig<never, P>,
  ): Promise<T | null>;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T | null;
}

export class HttpError extends Error {
  status: number;
  errors?: ApiFieldError[];

  constructor({
    status,
    message,
    errors,
  }: {
    status: number;
    message: string;
    errors?: ApiFieldError[];
  }) {
    super(message);

    this.name = "HttpError";
    this.status = status;
    this.errors = errors;
  }
}
