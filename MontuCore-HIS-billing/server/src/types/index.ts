// Type definitions for Express Request with authenticated user
import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
