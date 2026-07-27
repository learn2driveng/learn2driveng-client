export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: Record<string, string[]>;
}

/** Matches server discovery/list pagination envelope. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiSuccessResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
