import type { DatabaseFilter, PaginationOptions, PaginationRequest } from '../../../shared/types';
import { DEFAULT_PAGINATION_OPTIONS } from './DEFAULT_PAGINATION_OPTIONS';

/**
 * Convert pagination request to database filter
 */

export const paginationToFilter = (
  pagination: PaginationRequest,
  options: PaginationOptions = {},
): DatabaseFilter => {
  const opts = { ...DEFAULT_PAGINATION_OPTIONS, ...options };
  const page = Math.max(1, pagination.page ?? 1);
  const pageSize = Math.min(
    Math.max(1, pagination.pageSize ?? opts.defaultPageSize),
    opts.maxPageSize,
  );

  return {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    sortBy: pagination.sortBy,
    sortOrder: pagination.sortOrder,
  };
};
