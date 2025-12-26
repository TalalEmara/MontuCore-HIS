import { ValidationError } from './AppError.js';

/**
 * Base validation utilities for common patterns
 */

/**
 * Validate required fields exist in data
 */
export const validateRequired = (data: any, fields: string[]): void => {
  const missing = fields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
  }
};

/**
 * Validate positive integer
 */
export const validatePositiveInt = (value: any, fieldName: string): void => {
  const num = Number(value);
  if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
    throw new ValidationError(`${fieldName} must be a positive integer`);
  }
};

/**
 * Validate enum value
 */
export const validateEnum = (value: any, allowedValues: string[], fieldName: string): void => {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`
    );
  }
};

/**
 * Validate date format
 */
export const validateDate = (value: any, fieldName: string): void => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new ValidationError(`${fieldName} must be a valid date`);
  }
};

/**
 * Sanitize and validate pagination parameters
 */
export const validatePagination = (page: any, limit: any) => {
  const p = parseInt(page as string) || 1;
  const l = parseInt(limit as string) || 10;
  
  if (p < 1) throw new ValidationError('Page must be >= 1');
  if (l < 1 || l > 100) throw new ValidationError('Limit must be between 1 and 100');
  
  return { page: p, limit: l };
};
