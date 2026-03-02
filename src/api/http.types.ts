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

  delete<T, P extends Record<string, unknown> = Record<string, unknown>>(
    config: HttpRequestConfig<never, P>,
  ): Promise<T | null>;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T | null;
}

export interface ApiErrorResponse {
  success: false;
  message?: string | null;
  errors?: ApiErrorItem[] | null;
}

export interface ApiErrorItem {
  message: string;
  field?: string;
}

export class HttpError extends Error {
  status: number;
  errors?: ApiErrorItem[];

  constructor(params: {
    status: number;
    message: string;
    errors?: ApiErrorItem[];
  }) {
    super(params.message);
    this.status = params.status;
    this.errors = params.errors;
  }
}
