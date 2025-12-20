import { ValidationError } from '../../utils/AppError.js';

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 */
export const validateEmail = (email: string): void => {
  if (!email || typeof email !== 'string') {
    throw new ValidationError('Email is required');
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new ValidationError('Invalid email format');
  }
};

/**
 * Validate permissions structure
 */
export const validatePermissions = (permissions: any): void => {
  if (!permissions || typeof permissions !== 'object') {
    throw new ValidationError('Permissions must be a valid object');
  }

  // Check if at least one permission is provided
  const hasCases = Array.isArray(permissions.caseIds) && permissions.caseIds.length > 0;
  const hasExams = Array.isArray(permissions.examIds) && permissions.examIds.length > 0;
  const hasLabs = Array.isArray(permissions.labIds) && permissions.labIds.length > 0;

  if (!hasCases && !hasExams && !hasLabs) {
    throw new ValidationError('At least one permission (caseIds, examIds, or labIds) must be provided');
  }

  // Validate array contents
  if (permissions.caseIds && !Array.isArray(permissions.caseIds)) {
    throw new ValidationError('caseIds must be an array');
  }

  if (permissions.examIds && !Array.isArray(permissions.examIds)) {
    throw new ValidationError('examIds must be an array');
  }

  if (permissions.labIds && !Array.isArray(permissions.labIds)) {
    throw new ValidationError('labIds must be an array');
  }

  // Validate that all IDs are positive integers
  const validateIdArray = (arr: any[], fieldName: string) => {
    if (!arr.every((id: any) => Number.isInteger(id) && id > 0)) {
      throw new ValidationError(`All ${fieldName} must be positive integers`);
    }
  };

  if (permissions.caseIds?.length) {
    validateIdArray(permissions.caseIds, 'caseIds');
  }

  if (permissions.examIds?.length) {
    validateIdArray(permissions.examIds, 'examIds');
  }

  if (permissions.labIds?.length) {
    validateIdArray(permissions.labIds, 'labIds');
  }

  // Validate notes if provided
  if (permissions.notes && typeof permissions.notes !== 'string') {
    throw new ValidationError('Notes must be a string');
  }
};

/**
 * Validate expiry hours
 */
export const validateExpiryHours = (hours: any): void => {
  if (hours !== undefined) {
    const numHours = Number(hours);
    if (isNaN(numHours) || numHours <= 0 || numHours > 168) { // Max 7 days
      throw new ValidationError('Expiry hours must be between 1 and 168 (7 days)');
    }
  }
};

/**
 * Validate athlete ID
 */
export const validateAthleteId = (athleteId: any): void => {
  const id = Number(athleteId);
  if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
    throw new ValidationError('Invalid athlete ID');
  }
};

/**
 * Validate token format
 */
export const validateToken = (token: any): void => {
  if (!token || typeof token !== 'string' || token.length < 10) {
    throw new ValidationError('Invalid token format');
  }
};
