import type { PaginatedResult } from '../../../shared/types';
import { createPaginationMetadata } from './createPaginationMetadata';

/**
 * Create a paginated result wrapper
 */

export const createPaginatedResult = <T>(
  data: T[],
  totalItems: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> => {
  return {
    data,
    pagination: createPaginationMetadata(totalItems, page, pageSize),
  };
};
