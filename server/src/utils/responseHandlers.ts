import type { Request, Response } from 'express';
import { AppError } from './AppError.js';

/**
 * Base wrapper for async route handlers with error handling
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response) => {
    Promise.resolve(fn(req, res)).catch((error: any) => {
      console.error('Handler Error:', error);
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
          code: error.constructor.name.replace('Error', '').toUpperCase()
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    });
  };
};

/**
 * Success response wrapper
 */
export const successResponse = (res: Response, data: any, message?: string, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    data
  });
};

/**
 * Created response wrapper (201)
 */
export const createdResponse = (res: Response, data: any, message = 'Resource created successfully') => {
  return successResponse(res, data, message, 201);
};

/**
 * Pagination response wrapper
 */
export const paginatedResponse = (res: Response, data: any[], pagination: any, additionalData?: any) => {
  return res.status(200).json({
    success: true,
    data,
    pagination,
    ...additionalData
  });
};
