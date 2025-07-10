import type { DatabaseFilter, PaginationRequest } from '../../../shared/types';
import { paginationToFilter } from './paginationToFilter';

/**
 * Pagination utilities
 */

export const createPaginationFilter = (
  pagination: PaginationRequest,
  baseFilter?: DatabaseFilter,
): DatabaseFilter => {
  const paginationFilter = paginationToFilter(pagination);

  if (!baseFilter) {
    return paginationFilter;
  }

  return {
    ...baseFilter,
    ...paginationFilter,
    // Merge where conditions if both exist
    where: {
      ...baseFilter.where,
      ...paginationFilter.where,
    },
  };
};
