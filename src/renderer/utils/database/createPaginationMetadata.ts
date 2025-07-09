import type { PaginationMetadata } from '../../../shared/types';

/**
 * Create pagination metadata from results and parameters
 */

export const createPaginationMetadata = (
  totalItems: number,
  page: number,
  pageSize: number,
): PaginationMetadata => {
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    page: Math.max(1, page),
    pageSize: Math.max(1, pageSize),
    totalItems: Math.max(0, totalItems),
    totalPages: Math.max(1, totalPages),
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};
