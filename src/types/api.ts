export type ApiFieldErrors = Record<string, string[] | string>;

export type ApiErrorPayload = {
  message?: string;
  errors?: ApiFieldErrors;
};

export type PaginationMeta = {
  current_page?: number;
  per_page?: number;
  total?: number;
  last_page?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta?: PaginationMeta;
};

export type ApiListResponse<T> = T[] | PaginatedResponse<T>;

export type ApiError = {
  status: number;
  message: string;
  errors?: ApiFieldErrors;
};
