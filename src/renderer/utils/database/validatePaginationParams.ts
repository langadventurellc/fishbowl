import type { PaginationOptions } from '../../../shared/types';
import { DEFAULT_PAGINATION_OPTIONS } from './DEFAULT_PAGINATION_OPTIONS';

/**
 * Validate pagination parameters
 */

export const validatePaginationParams = (
  page?: number,
  pageSize?: number,
  options: PaginationOptions = {},
): { isValid: boolean; errors: string[] } => {
  const opts = { ...DEFAULT_PAGINATION_OPTIONS, ...options };
  const errors: string[] = [];

  if (page !== undefined && (page < 1 || !Number.isInteger(page))) {
    errors.push('Page must be a positive integer');
  }

  if (pageSize !== undefined) {
    if (pageSize < 1 || !Number.isInteger(pageSize)) {
      errors.push('Page size must be a positive integer');
    } else if (pageSize > opts.maxPageSize) {
      errors.push(`Page size cannot exceed ${opts.maxPageSize}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
