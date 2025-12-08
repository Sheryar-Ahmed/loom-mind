/**
 * API Response Types
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, string[]>;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
